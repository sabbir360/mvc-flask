/**
 * Created by Sabbir on 04/25/2017.
 */

var _sort_back_color_grid = "";

the_sgrid = {
    table_id: "#sGrid",
    table_header: {},

    initialize: function () {

        var sortable_field = "";
        var raw_meta = $(the_sgrid.table_id + " .sgrid-meta").val();
        if (raw_meta != undefined) {
            var meta = JSON.parse(raw_meta);
            var params = meta.params;
            $(the_sgrid.table_id + " .asc-sortable").click(function () {
                sortable_field = $(this).attr("data-name");
                params.sort_type = "desc";
                trigger_ajax_call();
            });
            $(the_sgrid.table_id + " .dsc-sortable").click(function () {
                sortable_field = $(this).attr("data-name");
                params.sort_field = sortable_field;
                params.sort_type = "asc";
                trigger_ajax_call();
            });

            $(the_sgrid.table_id + " .page-number a").click(function () {
                params.page_index = $(this).attr("data-page");
                sortable_field = params.sort_field
                trigger_ajax_call();
            });

            function trigger_ajax_call() {

                params.sort_field = sortable_field;
                _sort_back_color_grid = sortable_field;
                the_sgrid.loadData(meta.url, params);
                // _trigger_ajax_call_grid=false;

            }

        }

    },
    loadData: function (url, params) {
        $(the_sgrid.table_id + " .sgrid-loader").show();
        // the_sgrid.initialize();
        the_sgrid.url = url;

        if (url) {

            if (!params.hasOwnProperty("json")) {
                params.json = true;
            }
            the_sgrid.params = params;
            $.ajax({
                url: url,
                type: "GET",
                contentType: 'application/json; charset=utf-8',
                data: params,
                success: function (response) {
                    the_sgrid.loadTable(response);
                    // $(the_sgrid.table_id+" .sgrid-loader").hide();
                },
                error: function (error) {
                    console.log(error);
                    console.log("That odd! But above error occurred for SGRID...!");
                    the_sgrid.loadTable({});

                }
            });
        }
    },
    loadTable: function (data) {
        var header = "";
        var tr = "";

        if (data.hasOwnProperty("value")) {

            var header_len = data.table_header.length;
            var row_len = data.value.length;
            var sortable = "";
            var sortable_background = "";
            var sort_class = "";
            var glyph_icon_sort = ""
            for (var a = 0; a < header_len; a++) {

                //check for sorting
                if (data.table_header[a].sortable) {

                    if (data.table_header[a].asc == "asc") {
                        sort_class = "asc-sortable";
                        glyph_icon_sort = "";
                    } else {
                        sort_class = "dsc-sortable";
                        glyph_icon_sort = "-alt";
                    }

                    /*if (_sort_back_color_grid == data.table_header[a].name) {
                     sortable_background = "style='background-color:yellow'";
                     }else*/
                    if (data.meta.hasOwnProperty("sort_field") && data.meta.sort_field == data.table_header[a].name) {
                        sortable_background = "style='background-color:yellow'";
                    }

                    sortable = data.table_header[a].title +
                        "<a href='javascript:void(0)' " + sortable_background +
                        "data-name='" + data.table_header[a].name + "' class='" +
                        sort_class + "'><span class='glyphicon glyphicon-sort-by-alphabet" + glyph_icon_sort + "'></span></a>";

                    sortable_background = "";

                } else {
                    sortable = data.table_header[a].title;
                }
                header += "<th>" + sortable + "</th>";
            }

            for (var b = 0; b < row_len; b++) {

                var td = "";

                for (var i = 0; i < data.value[b].length; i++) {
                    td += "<td>" + data.value[b][i].value + "</td>";
                }
                tr = tr + "<tr>" + td + "</tr>";
            }

            tr += "<input type='hidden' class='sgrid-meta' value='" + JSON.stringify(data.meta) + "' />"

        } else if (data.hasOwnProperty("td")) {
            tr = "<td>" + data.td + "</td>";
        } else {
            tr = "<td>Seems something went wrong! Check Console.</td>";
            console.log(data);
            console.log("Load table is incomplete. SGRID...")
        }

        var final_table = "<table class=\"table\"><thead><tr>" + header + "</tr></thead><tbody>" + tr + "</tbody></table>";

        if (data.hasOwnProperty("paginate")) {
            var current_page = data.paginate.page_index;
            var item_per_page = data.paginate.item_per_page;
            var total_rows = data.paginate.page_size;

            if (total_rows > 0) {
                var total_pages = Math.ceil(total_rows / item_per_page);
                var pages_html = "";
                var start_page_html = ""
                var end_page_html = ""
                var page_start = current_page
                if(page_start>1){
                    page_start = page_start-1;
                }
                var page_count = 0;
                for (var p = page_start; p <= total_pages; p++) {

                    page_count++;

                    var page_activate = ""
                    if (p == current_page) {
                        page_activate = "activate"
                    }
                    if(total_pages!=current_page){
                        end_page_html = "<div class='page-number'><a data-page='"+ total_pages +"' href='javascript:void(0);'><span>&gt;&gt;</span></a></div>";
                    }
                    if(1!=current_page){
                        start_page_html = "<div class='page-number'><a data-page='1' href='javascript:void(0);'><span >&lt;&lt;</span></a></div>";
                    }
                    pages_html += "<div class='page-number " + page_activate + "'><a data-page='"+ p +"' href='javascript:void(0);'><span >" + p.toString() + "</span></a></div>";
                     if(page_count==10){
                        break;
                    }
                }

                final_table = final_table + '<div class="sgrid-page">' + start_page_html + pages_html + end_page_html + '</div>';

            }


        }


        $(the_sgrid.table_id).html('<div class="sgrid-loader">Loading....</div>' + final_table);
        the_sgrid.initialize();
        $(the_sgrid.table_id + " .sgrid-loader").hide();

        //this part for URL push
        /*if (data.hasOwnProperty("meta")) {
         var str = Object.keys(data.meta.params).map(function (key) {
         if(key=="json"){
         return ""
         }else{
         return encodeURIComponent(key) + '=' + encodeURIComponent(data.meta.params[key]);
         }


         }).join('&');
         history.pushState({}, document.title, data.meta.url+"?"+str)
         }*/
    }

}