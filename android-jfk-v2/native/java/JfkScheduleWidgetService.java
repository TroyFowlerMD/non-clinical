package com.troyfowlermd.jfkmedstaffschedule;

import android.content.Context;
import android.content.Intent;
import android.view.View;
import android.widget.RemoteViews;
import android.widget.RemoteViewsService;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;

public class JfkScheduleWidgetService extends RemoteViewsService {
    @Override
    public RemoteViewsFactory onGetViewFactory(Intent intent) {
        return new Factory(getApplicationContext());
    }

    static class Factory implements RemoteViewsFactory {
        private final Context context;
        private final List<Item> items = new ArrayList<>();

        Factory(Context context) {
            this.context = context;
        }

        @Override public void onCreate() {}
        @Override public void onDestroy() { items.clear(); }
        @Override public int getViewTypeCount() { return 1; }
        @Override public long getItemId(int position) { return position; }
        @Override public boolean hasStableIds() { return false; }
        @Override public RemoteViews getLoadingView() { return null; }

        @Override
        public void onDataSetChanged() {
            items.clear();
            JSONObject snapshot = JfkScheduleWidgetStore.getSnapshot(context);
            if (snapshot == null) {
                items.add(Item.message("Open app to load today's schedule."));
                return;
            }
            JSONArray sections = snapshot.optJSONArray("sections");
            if (sections == null || sections.length() == 0) {
                items.add(Item.message("No displayable assignments."));
                return;
            }
            for (int s = 0; s < sections.length(); s++) {
                JSONObject section = sections.optJSONObject(s);
                if (section == null) continue;
                String title = section.optString("title", "");
                String color = section.optString("color", "#9ba3aa");
                items.add(Item.section(title, color));
                JSONArray rows = section.optJSONArray("rows");
                if (rows == null) continue;
                for (int r = 0; r < rows.length(); r++) {
                    JSONObject row = rows.optJSONObject(r);
                    if (row == null) continue;
                    items.add(Item.row(
                        row.optString("label", ""),
                        peopleText(row.optJSONArray("psych")),
                        peopleText(row.optJSONArray("medical"))
                    ));
                }
            }
        }

        @Override public int getCount() { return items.size(); }

        @Override
        public RemoteViews getViewAt(int position) {
            Item item = items.get(position);
            RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.jfk_schedule_widget_item);
            views.setViewVisibility(R.id.item_section, item.kind == Item.KIND_SECTION ? View.VISIBLE : View.GONE);
            views.setViewVisibility(R.id.item_row, item.kind == Item.KIND_ROW ? View.VISIBLE : View.GONE);
            views.setViewVisibility(R.id.item_message, item.kind == Item.KIND_MESSAGE ? View.VISIBLE : View.GONE);
            views.setTextViewText(R.id.item_section_title, item.sectionTitle);
            views.setTextViewText(R.id.item_label, item.label);
            views.setTextViewText(R.id.item_psych, item.psych);
            views.setTextViewText(R.id.item_medical, item.medical);
            views.setTextViewText(R.id.item_message, item.message);
            try {
                views.setInt(R.id.item_section_bar, "setBackgroundColor", android.graphics.Color.parseColor(item.color));
            } catch (Exception ignored) {
                views.setInt(R.id.item_section_bar, "setBackgroundColor", android.graphics.Color.parseColor("#9ba3aa"));
            }
            return views;
        }

        private static String peopleText(JSONArray people) {
            if (people == null || people.length() == 0) return "";
            StringBuilder out = new StringBuilder();
            for (int i = 0; i < people.length(); i++) {
                JSONObject person = people.optJSONObject(i);
                if (person == null) continue;
                if (out.length() > 0) out.append('\n');
                out.append(person.optString("name", ""));
                String note = person.optString("note", "");
                if (!note.isEmpty()) out.append(" - ").append(note);
            }
            return out.toString();
        }
    }

    static class Item {
        static final int KIND_SECTION = 1;
        static final int KIND_ROW = 2;
        static final int KIND_MESSAGE = 3;

        int kind;
        String sectionTitle = "";
        String color = "#9ba3aa";
        String label = "";
        String psych = "";
        String medical = "";
        String message = "";

        static Item section(String title, String color) {
            Item item = new Item();
            item.kind = KIND_SECTION;
            item.sectionTitle = title;
            item.color = color;
            return item;
        }

        static Item row(String label, String psych, String medical) {
            Item item = new Item();
            item.kind = KIND_ROW;
            item.label = label;
            item.psych = psych;
            item.medical = medical;
            return item;
        }

        static Item message(String message) {
            Item item = new Item();
            item.kind = KIND_MESSAGE;
            item.message = message;
            return item;
        }
    }
}
