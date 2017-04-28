/**
 * Created by Sabbir on 04/25/2017.
 */

var _sort_back_color_grid = "";

the_sgrid = {
    table_id: "#sGrid",
    table_header: {},
    initialize: function () {

        $(the_sgrid.table_id + " .asc-sortable").click(function () {

            var meta = JSON.parse($(the_sgrid.table_id + " .sgrid-meta").val());
            var sortable_field = $(this).attr("data-name");
            var params = meta.params;
            params.sort_field = sortable_field;
            params.sort_type = "desc";
            the_sgrid.loadData(meta.url, params);
            _sort_back_color_grid = sortable_field;
            // $(this).attr("style", "background-color:yellow;");
        });
        $(the_sgrid.table_id + " .dsc-sortable").click(function () {
            var meta = JSON.parse($(the_sgrid.table_id + " .sgrid-meta").val());
            var sortable_field = $(this).attr("data-name");
            var params = meta.params;
            params.sort_field = sortable_field;
            params.sort_type = "asc";
            the_sgrid.loadData(meta.url, params);
            // $(this).attr("style", "background-color:yellow;");
            _sort_back_color_grid = sortable_field;
        });
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
            var glyph_icon_sort =""
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
                    if(data.meta.hasOwnProperty("sort_field") && data.meta.sort_field == data.table_header[a].name){
                        sortable_background = "style='background-color:yellow'";
                    }

                    sortable = data.table_header[a].title +
                        "<a href='javascript:void(0)' " + sortable_background +
                        "data-name='" + data.table_header[a].name + "' class='" +
                        sort_class + "'><span class='glyphicon glyphicon-sort-by-alphabet"+glyph_icon_sort+"'></span></a>";

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
        $(the_sgrid.table_id).html('<div class="sgrid-loader">Loading....</div>' + final_table);
        the_sgrid.initialize();
        $(the_sgrid.table_id + " .sgrid-loader").hide();
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