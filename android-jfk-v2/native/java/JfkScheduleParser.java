package com.troyfowlermd.jfkmedstaffschedule;

import org.json.JSONArray;
import org.json.JSONObject;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.TimeZone;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

final class JfkScheduleParser {
    private static final String[] ORDER = {"Team A", "Team B", "ARS-E", "ARS-H", "IN", "Admin", "SP", "Flex"};
    private static final String TOKEN_RE = "(TEAM\\s*A|TEAM\\s*B|ARS\\s*-?\\s*E\\s*/\\s*H|ARS\\s*-?\\s*E|ARS\\s*-?\\s*H|ARS\\s*E/H|ARS\\s*E|ARS\\s*H|\\bARS\\b|ADMIN|WFH|\\bSP\\b|FLEX|\\bIN\\b|\\bACU\\b|\\bJFK\\b|BROUGHTON|\\bPRN\\b|FAST\\s*TRACK)";
    private static final Pattern TOKEN_PATTERN = Pattern.compile(TOKEN_RE, Pattern.CASE_INSENSITIVE);

    private static final Person[] MEDICAL = {
        new Person("Griffith, S", "Griffith", "+19084033248", ""),
        new Person("Millonas, S", "Millonas", "+18083914357", ""),
        new Person("Kuetemeyer", "Kuetemeyer", "+12032531662", ""),
        new Person("Bandell", "Bandell", "+14439287357", "Medical column"),
        new Person("Nolan", "Nolan", "+18284121095", ""),
        new Person("Moore", "Moore", "+18284236673", ""),
        new Person("King", "King", "+15018376887", ""),
        new Person("Edwards", "Edwards", "+18289251696", ""),
        new Person("Ramirez", "Ramirez", "+12034701369", ""),
        new Person("Poetter MD", "Poetter", "+13365492166", ""),
        new Person("Dill MD", "Dill", "+18285067870", ""),
        new Person("DeBell MD", "DeBell", "+19703761182", ""),
        new Person("McKay MD", "McKay", "+18286825479", ""),
        new Person("Wolf", "Wolf", "+14102183110", "")
    };

    private static final Person[] PSYCH = {
        new Person("Anderson", "Anderson", "+19122222759", ""),
        new Person("Fowler", "Fowler", "+13606061046", ""),
        new Person("Carter", "Carter", "+19198641056", ""),
        new Person("Ondreyka", "Ondreyka", "+17347091295", ""),
        new Person("Smith", "Smith", "+18285513508", ""),
        new Person("Cooley", "Cooley", "+19137102670", ""),
        new Person("Patil", "Patil", "+14238029271", ""),
        new Person("German", "German", "+13364651513", "")
    };

    private static final String[][] PHONE = {
        {"Griffith", "+19084033248"}, {"Millonas", "+18083914357"}, {"Kuetemeyer", "+12032531662"},
        {"Bandell", "+14439287357"}, {"Nolan", "+18284121095"}, {"Moore", "+18284236673"},
        {"King", "+15018376887"}, {"Edwards", "+18289251696"}, {"Ramirez", "+12034701369"},
        {"Poetter", "+13365492166"}, {"Dill", "+18285067870"}, {"DeBell", "+19703761182"},
        {"McKay", "+18286825479"}, {"Wolf", "+14102183110"}, {"Fowler", "+13606061046"},
        {"Ondreyka", "+17347091295"}, {"Carter", "+19198641056"}, {"Anderson", "+19122222759"},
        {"Cooley", "+19137102670"}, {"Smith", "+18285513508"}, {"Wren", "+19098023352"},
        {"Patil", "+14238029271"}, {"German", "+13364651513"}, {"Coburn", "+16173061134"},
        {"Bennett", "+13362602926"}, {"Williams", "+19199153291"}, {"Eidson", "+18034132609"},
        {"Tran", "+19808002145"}, {"Camiliere", "+14805861791"}, {"Dickerson", "+18137663257"},
        {"Morales", "+18647048569"}
    };

    private JfkScheduleParser() {}

    static JSONObject buildSnapshot(JSONObject json, JSONObject meta, String preferredDate) throws Exception {
        JSONArray headers = json.optJSONArray("headers");
        JSONArray rows = json.optJSONArray("rows");
        if (headers == null || rows == null) throw new IllegalArgumentException("Schedule JSON missing headers or rows");
        ColMap cols = buildCols(headers);
        List<RowData> data = buildRows(rows, cols);
        if (data.isEmpty()) throw new IllegalArgumentException("Schedule JSON has no dated rows");
        RowData row = chooseRow(data, preferredDate);
        DayData day = dayData(row, cols);

        JSONObject snapshot = new JSONObject();
        snapshot.put("version", 1);
        snapshot.put("dailyDate", row.date);
        snapshot.put("title", titleForDate(row.date));
        snapshot.put("asOf", formatAsOf(meta.optString("asOf", scheduleTimestamp(json))));
        snapshot.put("label", meta.optString("label", ""));
        JSONArray sections = buildSections(row, day);
        snapshot.put("sections", sections);
        snapshot.put("rows", flattenRows(sections));
        return snapshot;
    }

    static String scheduleTimestamp(JSONObject json) {
        String[] fields = {"updatedAt", "modifiedTime", "modified_time", "lastModified", "lastUpdated", "fetchedAt"};
        for (String field : fields) {
            String value = json.optString(field, "");
            if (value != null && !value.trim().isEmpty()) return value;
        }
        return "";
    }

    static String isoNow() {
        SimpleDateFormat fmt = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.US);
        fmt.setTimeZone(TimeZone.getTimeZone("UTC"));
        return fmt.format(new Date());
    }

    static String addDays(String iso, int delta) throws Exception {
        Date d = new SimpleDateFormat("yyyy-MM-dd", Locale.US).parse(iso);
        if (d == null) throw new IllegalArgumentException("Missing widget date");
        Calendar calendar = Calendar.getInstance();
        calendar.setTime(d);
        calendar.add(Calendar.DATE, delta);
        return new SimpleDateFormat("yyyy-MM-dd", Locale.US).format(calendar.getTime());
    }

    private static ColMap buildCols(JSONArray headers) {
        ColMap c = new ColMap(headers);
        c.date = first(headers, 0, headers.length(), h -> nhead(h).equals("date"));
        c.day = first(headers, 0, headers.length(), h -> {
            String n = nhead(h);
            return n.equals("day of week") || n.equals("day of the week") || n.equals("day");
        });
        c.medRes = first(headers, 0, headers.length(), h -> nhead(h).contains("resident") || nhead(h).contains("fellowship"));
        c.psychRes = last(headers, h -> nhead(h).contains("resident") || nhead(h).contains("fellowship"));
        c.overnight = first(headers, 0, headers.length(), h -> nhead(h).contains("med staff overnight") || nhead(h).contains("overnight coverage"));
        c.backup = first(headers, 0, headers.length(), h -> nhead(h).contains("back") && nhead(h).contains("primary"));
        c.fast = first(headers, 0, headers.length(), h -> nhead(h).contains("clarification") || nhead(h).contains("fast track"));
        c.pharmacy = first(headers, 0, headers.length(), h -> nhead(h).contains("pharmacy"));
        int date2 = first(headers, Math.max(c.psychRes + 1, 0), headers.length(), h -> nhead(h).equals("date"));

        int medEnd = c.medRes > 0 ? c.medRes : headers.length();
        for (int i = 0; i < MEDICAL.length; i++) {
            int col = first(headers, 0, medEnd, h -> sameHeader(h, MEDICAL[i].header));
            if (col >= 0) c.med.add(MEDICAL[i].withCol(i, col));
        }

        int psychStart = c.pharmacy >= 0 ? c.pharmacy + 1 : 0;
        int psychEnd = c.psychRes >= 0 ? c.psychRes : headers.length();
        for (int i = 0; i < PSYCH.length; i++) {
            int col = first(headers, psychStart, psychEnd, h -> sameHeader(h, PSYCH[i].header));
            if (col >= 0) c.psych.add(PSYCH[i].withCol(i, col));
        }

        Set<Integer> skip = new HashSet<>();
        int[] skipped = {c.date, c.day, c.medRes, c.psychRes, c.overnight, c.backup, c.fast, c.pharmacy, date2};
        for (int value : skipped) if (value >= 0) skip.add(value);
        int extraStart = c.psychRes >= 0 ? c.psychRes + 1 : headers.length();
        int extraEnd = date2 >= 0 ? date2 : headers.length();
        for (int i = extraStart; i < extraEnd; i++) {
            if (skip.contains(i)) continue;
            String raw = headers.optString(i, "");
            String nh = nhead(raw);
            if (nh.isEmpty() || nh.matches(".*(date|day|overnight|back|pharmacy|fast|clarif|resident|fellow|call|coverage).*")) continue;
            if (!nh.matches("^[a-z][a-z\\s,'-]+$")) continue;
            String label = cleanHeader(raw);
            if (label.isEmpty() || containsLabel(c.psych, label)) continue;
            c.psych.add(new Person(raw, label, phoneFor(label), label.equals("Bandell") ? "Psych column" : "").withCol(c.psych.size(), i));
        }
        return c;
    }

    private static List<RowData> buildRows(JSONArray rows, ColMap cols) {
        List<RowData> out = new ArrayList<>();
        for (int i = 0; i < rows.length(); i++) {
            JSONArray row = rows.optJSONArray(i);
            if (row == null) continue;
            String date = parseDate(row.optString(cols.date, ""));
            if (date.isEmpty()) continue;
            out.add(new RowData(
                row,
                date,
                row.optString(cols.day, ""),
                cols.medRes >= 0 ? row.optString(cols.medRes, "").trim() : "",
                cols.psychRes >= 0 ? row.optString(cols.psychRes, "").trim() : "",
                cols.overnight >= 0 ? row.optString(cols.overnight, "").trim() : "",
                cols.backup >= 0 ? row.optString(cols.backup, "").trim() : "",
                cols.fast >= 0 ? row.optString(cols.fast, "").trim() : "",
                cols.pharmacy >= 0 ? row.optString(cols.pharmacy, "").trim() : ""
            ));
        }
        Collections.sort(out, Comparator.comparing(r -> r.date));
        return out;
    }

    private static RowData chooseRow(List<RowData> data, String preferredDate) {
        if (preferredDate != null && !preferredDate.trim().isEmpty()) {
            for (RowData row : data) if (row.date.equals(preferredDate)) return row;
        }
        String today = new SimpleDateFormat("yyyy-MM-dd", Locale.US).format(new Date());
        for (RowData row : data) if (row.date.equals(today)) return row;
        for (RowData row : data) if (row.date.compareTo(today) >= 0) return row;
        return data.get(data.size() - 1);
    }

    private static DayData dayData(RowData row, ColMap cols) {
        return new DayData(
            providers(row, cols.psych),
            providers(row, cols.med),
            residents(row.psychResRaw),
            residents(row.medResRaw)
        );
    }

    private static JSONArray buildSections(RowData row, DayData day) throws Exception {
        JSONArray sections = new JSONArray();
        addSection(sections, "ACU", "acu", "#6cc7bd", rowsForCategories(new String[]{"Team A", "Team B"}, day));
        addSection(sections, "ARS", "ars", "#6fa8dc", rowsForCategories(new String[]{"ARS-E", "ARS-H"}, day));
        JSONArray residentRows = new JSONArray();
        if (!day.psychRes.isEmpty() || !day.medRes.isEmpty()) residentRows.put(rowJson("", day.psychRes, day.medRes));
        addSection(sections, "Residents / Fellows", "res", "#b08af5", residentRows);
        JSONArray other = rowsForCategories(new String[]{"IN", "Admin", "SP", "Flex"}, day);
        addSection(sections, "Other", "other", "#e6bf50", other);
        JSONArray coverage = new JSONArray();
        addCoverageRow(coverage, "Overnight", row.overnight);
        addCoverageRow(coverage, "Backup", row.backup);
        addCoverageRow(coverage, "Fast Track", row.fast);
        addCoverageRow(coverage, "Pharmacy", row.pharmacy);
        addSection(sections, "Coverage", "coverage", "#9ba3aa", coverage);
        return sections;
    }

    private static void addSection(JSONArray sections, String title, String id, String color, JSONArray rows) throws Exception {
        if (rows.length() == 0) return;
        JSONObject section = new JSONObject();
        section.put("id", id);
        section.put("title", title);
        section.put("color", color);
        section.put("rows", rows);
        sections.put(section);
    }

    private static JSONArray flattenRows(JSONArray sections) throws Exception {
        JSONArray out = new JSONArray();
        for (int s = 0; s < sections.length(); s++) {
            JSONObject section = sections.optJSONObject(s);
            if (section == null) continue;
            JSONArray rows = section.optJSONArray("rows");
            if (rows == null) continue;
            for (int r = 0; r < rows.length(); r++) {
                JSONObject row = rows.optJSONObject(r);
                if (row == null) continue;
                JSONObject copy = new JSONObject(row.toString());
                copy.put("sectionId", section.optString("id", ""));
                copy.put("sectionTitle", section.optString("title", ""));
                copy.put("sectionColor", section.optString("color", ""));
                out.put(copy);
            }
        }
        return out;
    }

    private static JSONArray rowsForCategories(String[] categories, DayData day) throws Exception {
        JSONArray rows = new JSONArray();
        for (String category : categories) {
            List<DisplayPerson> psych = filterCategory(day.psych, category);
            List<DisplayPerson> med = filterCategory(day.med, category);
            int max = Math.max(psych.size(), med.size());
            for (int i = 0; i < max; i++) {
                rows.put(rowJson(category, i < psych.size() ? singleton(psych.get(i)) : new ArrayList<>(), i < med.size() ? singleton(med.get(i)) : new ArrayList<>()));
            }
        }
        return rows;
    }

    private static JSONObject rowJson(String label, List<DisplayPerson> psych, List<DisplayPerson> medical) throws Exception {
        JSONObject row = new JSONObject();
        row.put("label", label);
        row.put("psych", peopleJson(psych));
        row.put("medical", peopleJson(medical));
        return row;
    }

    private static JSONArray peopleJson(List<DisplayPerson> people) throws Exception {
        JSONArray arr = new JSONArray();
        for (DisplayPerson person : people) {
            JSONObject item = new JSONObject();
            item.put("name", person.name);
            item.put("note", person.note);
            item.put("phone", person.phone);
            item.put("sourceLabel", person.sourceLabel);
            arr.put(item);
        }
        return arr;
    }

    private static List<DisplayPerson> providers(RowData row, List<Person> list) {
        List<DisplayPerson> out = new ArrayList<>();
        for (Person person : list) {
            String raw = person.col >= 0 ? row.row.optString(person.col, "").trim() : "";
            List<Entry> entries = assignmentEntries(raw);
            for (int i = 0; i < entries.size(); i++) {
                Entry entry = entries.get(i);
                out.add(new DisplayPerson(displayName(person.label), person.phone, entry.category, entry.note, person.sourceLabel, person.order, i));
            }
        }
        Collections.sort(out, (a, b) -> {
            int order = Integer.compare(order(a.category), order(b.category));
            if (order != 0) return order;
            int person = Integer.compare(a.order, b.order);
            if (person != 0) return person;
            int sub = Integer.compare(a.suborder, b.suborder);
            if (sub != 0) return sub;
            return a.name.compareTo(b.name);
        });
        return out;
    }

    private static List<DisplayPerson> residents(String raw) {
        List<DisplayPerson> out = new ArrayList<>();
        String[] parts = raw.split("[/,;]+");
        for (String part : parts) {
            String t = part.trim().replaceAll("\\s+(AM|PM)\\b.*$", "").replaceAll("[\\s.;,]+$", "");
            if (t.isEmpty()) continue;
            Matcher m = Pattern.compile("^([A-Za-z][A-Za-z'\\-\\s.]*?)(?:\\s*-\\s*([RF]))?\\b").matcher(t);
            String name = m.find() ? displayName(m.group(1).trim()) + (m.group(2) == null ? "" : "-" + m.group(2).toUpperCase(Locale.US)) : displayName(t);
            String base = name.replaceAll("-[RF]$", "");
            out.add(new DisplayPerson(name, phoneFor(base), "", "", "", out.size(), 0));
        }
        return out;
    }

    private static void addCoverageRow(JSONArray rows, String label, String value) throws Exception {
        List<DisplayPerson> psych = new ArrayList<>();
        List<DisplayPerson> med = new ArrayList<>();
        String[] parts = value.split("[/,;]+");
        for (String part : parts) {
            String name = displayName(part.trim());
            if (name.isEmpty()) continue;
            DisplayPerson item = new DisplayPerson(name, phoneFor(name), "", "", "", 0, 0);
            if (staffType(name).equals("med")) med.add(item); else psych.add(item);
        }
        if (!psych.isEmpty() || !med.isEmpty()) rows.put(rowJson(label, psych, med));
    }

    private static List<Entry> assignmentEntries(String raw) {
        List<Entry> out = new ArrayList<>();
        String text = raw.replace("\r", "\n").trim();
        if (text.isEmpty()) return out;
        String[] parts = text.split("[\\n;]+");
        for (String part : parts) {
            String n = ntext(part);
            if (nonWorkOnly(n)) continue;
            Matcher matcher = TOKEN_PATTERN.matcher(part);
            List<Match> matches = new ArrayList<>();
            while (matcher.find()) matches.add(new Match(matcher.start(), matcher.end(), matcher.group()));
            if (matches.isEmpty()) {
                if (!out.isEmpty() && Pattern.compile("OUT|NOON|\\bAM\\b|\\bPM\\b|\\d{3,4}|\\d+-\\d+", Pattern.CASE_INSENSITIVE).matcher(part).find()) {
                    Entry last = out.get(out.size() - 1);
                    String note = noteText(part, "");
                    if (!note.isEmpty()) last.note = (last.note + " " + note).trim();
                }
                continue;
            }
            for (int i = 0; i < matches.size(); i++) {
                Match match = matches.get(i);
                int next = i + 1 < matches.size() ? matches.get(i + 1).start : part.length();
                String span = part.substring(match.start, next);
                String note = noteText(span, match.text);
                for (String cat : catsFromToken(match.text)) out.add(new Entry(cat, note));
            }
        }
        return out;
    }

    private static List<String> catsFromToken(String token) {
        String n = ntext(token);
        List<String> out = new ArrayList<>();
        if (n.matches(".*TEAM\\s*A.*")) out.add("Team A");
        else if (n.matches(".*TEAM\\s*B.*")) out.add("Team B");
        else if (n.matches(".*ARS.*(E\\s*/\\s*H|E/H).*")) { out.add("ARS-E"); out.add("ARS-H"); }
        else if (n.matches(".*ARS.*(\\bH\\b|ARS-H).*")) out.add("ARS-H");
        else if (n.matches(".*ARS.*(\\bE\\b|ARS-E).*")) out.add("ARS-E");
        else if (n.matches(".*\\bARS\\b.*")) out.add("ARS-E");
        else if (n.matches(".*(ADMIN|WFH).*")) out.add("Admin");
        else if (n.matches(".*\\bSP\\b.*")) out.add("SP");
        else if (n.matches(".*FLEX.*")) out.add("Flex");
        else if (n.matches(".*(\\bIN\\b|\\bACU\\b|\\bJFK\\b|BROUGHTON|\\bPRN\\b|FAST\\s*TRACK).*")) out.add("IN");
        return out;
    }

    private static boolean nonWorkOnly(String n) {
        if (n.isEmpty()) return true;
        if (n.matches(".*(POST\\s*-?\\s*CALL|POSTCALL).*") || n.matches(".*\\bPC\\b.*")) return true;
        if (hasDisplayToken(n)) return false;
        return n.matches("^(OFF|VAC|HOL|OUT|NO CALL|OFF NO CALL|CME|CPI|CSL|EPIC|GOV|JURY|RHA|ORIENT|POL)(\\b|\\s).*");
    }

    private static boolean hasDisplayToken(String n) {
        return Pattern.compile("(TEAM\\s*A|TEAM\\s*B|ARS\\b|ARS\\s*-?\\s*[EH]|ADMIN|WFH|\\bSP\\b|FLEX|\\bIN\\b|\\bACU\\b|\\bJFK\\b|BROUGHTON|\\bPRN\\b|FAST\\s*TRACK)", Pattern.CASE_INSENSITIVE).matcher(n).find();
    }

    private static String noteText(String span, String token) {
        String s = span == null ? "" : span;
        if (token != null && !token.isEmpty()) s = s.replaceFirst("(?i)" + Pattern.quote(token), " ");
        s = s.replaceAll("[()]", " ").replaceAll("\\s+", " ").trim();
        s = s.replaceAll("^[-:\\s]+", "").replaceAll("(?i)\\b(confirmed|alone)\\b", "").replaceAll("\\s+", " ").trim();
        if (s.isEmpty()) return "";
        s = s.replaceAll("(?i)\\bAM\\b", "AM").replaceAll("(?i)\\bPM\\b", "PM").replaceAll("(?i)\\bOUT\\b", "Out").replaceAll("(?i)\\bNOON\\b", "Noon");
        return s;
    }

    private static String parseDate(String value) {
        String s = value == null ? "" : value.trim();
        if (s.isEmpty()) return "";
        Matcher iso = Pattern.compile("^(\\d{4})-(\\d{2})-(\\d{2})").matcher(s);
        if (iso.find()) return iso.group(1) + "-" + iso.group(2) + "-" + iso.group(3);
        Matcher slash = Pattern.compile("^(\\d{1,2})/(\\d{1,2})/(\\d{2,4})$").matcher(s);
        if (slash.find()) {
            String y = slash.group(3).length() == 2 ? "20" + slash.group(3) : slash.group(3);
            return y + "-" + pad2(slash.group(1)) + "-" + pad2(slash.group(2));
        }
        for (String pattern : new String[]{"EEE MMM dd HH:mm:ss zzz yyyy", "MMM d, yyyy", "M/d/yyyy"}) {
            try {
                Date d = new SimpleDateFormat(pattern, Locale.US).parse(s);
                return new SimpleDateFormat("yyyy-MM-dd", Locale.US).format(d);
            } catch (ParseException ignored) {}
        }
        return "";
    }

    private static String titleForDate(String iso) {
        try {
            Date d = new SimpleDateFormat("yyyy-MM-dd", Locale.US).parse(iso);
            return new SimpleDateFormat("EEE, MMM d", Locale.US).format(d);
        } catch (Exception e) {
            return "Schedule";
        }
    }

    private static String formatAsOf(String value) {
        if (value == null || value.trim().isEmpty()) return "";
        String[] patterns = {"yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", "yyyy-MM-dd'T'HH:mm:ss'Z'", "yyyy-MM-dd'T'HH:mm:ssXXX", "yyyy-MM-dd"};
        for (String pattern : patterns) {
            try {
                SimpleDateFormat input = new SimpleDateFormat(pattern, Locale.US);
                if (pattern.endsWith("'Z'")) input.setTimeZone(TimeZone.getTimeZone("UTC"));
                Date d = input.parse(value);
                return new SimpleDateFormat("MMM d, yyyy h:mm a", Locale.US).format(d);
            } catch (Exception ignored) {}
        }
        return value;
    }

    private static int first(JSONArray headers, int start, int end, HeaderPredicate predicate) {
        int s = Math.max(0, start);
        int e = Math.min(end, headers.length());
        for (int i = s; i < e; i++) if (predicate.matches(headers.optString(i, ""))) return i;
        return -1;
    }

    private static int last(JSONArray headers, HeaderPredicate predicate) {
        for (int i = headers.length() - 1; i >= 0; i--) if (predicate.matches(headers.optString(i, ""))) return i;
        return -1;
    }

    private static boolean sameHeader(String h, String expected) {
        String a = nhead(h);
        String b = nhead(expected);
        return a.equals(b) || a.replaceAll("\\s+md$", "").equals(b.replaceAll("\\s+md$", ""));
    }

    private static String nhead(String value) {
        return (value == null ? "" : value)
            .replaceAll("\\.\\d+$", "")
            .toLowerCase(Locale.US)
            .replaceAll("[\\r\\n\\s]+", " ")
            .replaceAll("[^\\w\\s,]+", " ")
            .replaceAll("\\s+", " ")
            .trim();
    }

    private static String ntext(String value) {
        return (value == null ? "" : value)
            .replaceAll("\\([^)]*\\)", " ")
            .replaceAll("[^\\w\\s/@.-]", " ")
            .replaceAll("\\s+", " ")
            .trim()
            .toUpperCase(Locale.US);
    }

    private static String cleanHeader(String h) {
        String v = (h == null ? "" : h).replaceAll("\\.\\d+$", "").trim().replaceAll("(?i)\\s+MD$", "");
        if (v.contains(",")) v = v.split(",")[0].trim();
        return displayName(v);
    }

    private static String displayName(String value) {
        String s = value == null ? "" : value.trim();
        if (s.isEmpty()) return "";
        String suffix = "";
        Matcher m = Pattern.compile("-([RF])$", Pattern.CASE_INSENSITIVE).matcher(s);
        if (m.find()) {
            suffix = "-" + m.group(1).toUpperCase(Locale.US);
            s = s.substring(0, s.length() - 2);
        }
        String[] parts = s.split("\\s+");
        StringBuilder out = new StringBuilder();
        for (String part : parts) {
            if (part.isEmpty()) continue;
            if (out.length() > 0) out.append(' ');
            if (part.contains("-")) {
                String[] inner = part.split("-");
                for (int i = 0; i < inner.length; i++) {
                    if (i > 0) out.append('-');
                    out.append(titleCase(inner[i]));
                }
            } else {
                out.append(titleCase(part));
            }
        }
        return out + suffix;
    }

    private static String titleCase(String value) {
        if (value == null || value.isEmpty()) return "";
        String lower = value.toLowerCase(Locale.US);
        return lower.substring(0, 1).toUpperCase(Locale.US) + lower.substring(1);
    }

    private static String phoneFor(String name) {
        for (String[] row : PHONE) if (row[0].equals(name)) return row[1];
        return "";
    }

    private static String staffType(String name) {
        for (Person p : PSYCH) if (p.label.equals(name)) return "psych";
        for (Person p : MEDICAL) if (p.label.equals(name)) return "med";
        return "psych";
    }

    private static boolean containsLabel(List<Person> people, String label) {
        for (Person person : people) if (person.label.equals(label)) return true;
        return false;
    }

    private static List<DisplayPerson> filterCategory(List<DisplayPerson> people, String category) {
        List<DisplayPerson> out = new ArrayList<>();
        for (DisplayPerson person : people) if (person.category.equals(category)) out.add(person);
        return out;
    }

    private static List<DisplayPerson> singleton(DisplayPerson person) {
        List<DisplayPerson> out = new ArrayList<>();
        out.add(person);
        return out;
    }

    private static int order(String category) {
        for (int i = 0; i < ORDER.length; i++) if (ORDER[i].equals(category)) return i;
        return 999;
    }

    private static String pad2(String v) {
        return v.length() == 1 ? "0" + v : v;
    }

    interface HeaderPredicate {
        boolean matches(String header);
    }

    static class Match {
        int start;
        int end;
        String text;
        Match(int start, int end, String text) { this.start = start; this.end = end; this.text = text; }
    }

    static class Entry {
        String category;
        String note;
        Entry(String category, String note) { this.category = category; this.note = note == null ? "" : note; }
    }

    static class Person {
        String header;
        String label;
        String phone;
        String sourceLabel;
        int order;
        int col = -1;
        Person(String header, String label, String phone, String sourceLabel) {
            this.header = header;
            this.label = label;
            this.phone = phone;
            this.sourceLabel = sourceLabel;
        }
        Person withCol(int order, int col) {
            Person p = new Person(header, label, phone, sourceLabel);
            p.order = order;
            p.col = col;
            return p;
        }
    }

    static class DisplayPerson {
        String name;
        String phone;
        String category;
        String note;
        String sourceLabel;
        int order;
        int suborder;
        DisplayPerson(String name, String phone, String category, String note, String sourceLabel, int order, int suborder) {
            this.name = name;
            this.phone = phone;
            this.category = category;
            this.note = note == null ? "" : note;
            this.sourceLabel = sourceLabel == null ? "" : sourceLabel;
            this.order = order;
            this.suborder = suborder;
        }
    }

    static class ColMap {
        JSONArray headers;
        int date = -1;
        int day = -1;
        int medRes = -1;
        int psychRes = -1;
        int overnight = -1;
        int backup = -1;
        int fast = -1;
        int pharmacy = -1;
        List<Person> med = new ArrayList<>();
        List<Person> psych = new ArrayList<>();
        ColMap(JSONArray headers) { this.headers = headers; }
    }

    static class RowData {
        JSONArray row;
        String date;
        String day;
        String medResRaw;
        String psychResRaw;
        String overnight;
        String backup;
        String fast;
        String pharmacy;
        RowData(JSONArray row, String date, String day, String medResRaw, String psychResRaw, String overnight, String backup, String fast, String pharmacy) {
            this.row = row;
            this.date = date;
            this.day = day;
            this.medResRaw = medResRaw;
            this.psychResRaw = psychResRaw;
            this.overnight = overnight;
            this.backup = backup;
            this.fast = fast;
            this.pharmacy = pharmacy;
        }
    }

    static class DayData {
        List<DisplayPerson> psych;
        List<DisplayPerson> med;
        List<DisplayPerson> psychRes;
        List<DisplayPerson> medRes;
        DayData(List<DisplayPerson> psych, List<DisplayPerson> med, List<DisplayPerson> psychRes, List<DisplayPerson> medRes) {
            this.psych = psych;
            this.med = med;
            this.psychRes = psychRes;
            this.medRes = medRes;
        }
    }
}
