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

            //ascending sorting
            $(the_sgrid.table_id + " .asc-sortable").click(function () {
                sortable_field = $(this).attr("data-name");
                params.sort_type = "desc";
                trigger_ajax_call();
            });

            //descending sorting
            $(the_sgrid.table_id + " .dsc-sortable").click(function () {
                sortable_field = $(this).attr("data-name");
                params.sort_field = sortable_field;
                params.sort_type = "asc";
                trigger_ajax_call();
            });

            //pagination
            $(the_sgrid.table_id + " .pagination li a").click(function () {
                params.page_index = $(this).attr("data-page");
                sortable_field = params.sort_field;
                trigger_ajax_call();
            });

            //filtering
            $(the_sgrid.table_id + " .start-filter").click(function () {
                var selector = $(the_sgrid.table_id + " .filter-container");

                sortable_field = params.sort_field;
                selector.each(function (index, item) {
                    var name = $(item).find(".value").attr("name");
                    if (name != undefined) {
                        params[name] = {
                            op: $(item).find(".operator option:selected").attr("data-value"),
                            val: $(item).find(".value").val()
                        }

                    }
                });

                trigger_ajax_call();
            });

            $(the_sgrid.table_id + " .reset-filter").click(function () {
                window.location.reload();
            });

            function trigger_ajax_call() {

                params.sort_field = sortable_field;
                _sort_back_color_grid = sortable_field;
                the_sgrid.loadData(meta.url, params);
                // _trigger_ajax_call_grid=false;

            }

            // set operator and value, for each filter result.
            var prev_select = "";

            $(the_sgrid.table_id + " .operator").on('focus', function () {
                prev_select = $(this).find("option:selected");
            }).change(function () {
                params[$(this).parent().find(".value").attr("name") + "[op]"] = $(this).find("option:selected").attr("data-value");
            });

            $(the_sgrid.table_id + " .value").on('change', function () {
                params[$(this).attr("name") + "[val]"] = this.value;
            });

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
        var filter_html = "";

        function selected_maker(operator, data, name) {
            if (data.meta.params.hasOwnProperty(name + "[op]")) {
                // op = data.params[name].op;
                // console.log(data.meta.params[name]);
                if (operator == data.meta.params[name + "[op]"]) {
                    return "selected='true'";
                }
            }

            return "";
        }

        function filter_input_value_set(data, name) {

            if (data.meta.params[name + "[val]"] != undefined) {
                // val = data.meta.params[data_table_head.name + "[val]"];
                return data.meta.params[name + "[val]"]
            }
            return "";
        }

        if (data.hasOwnProperty("value")) {

            var header_len = data.table_header.length;
            var row_len = data.value.length;
            var sortable = "";
            var sortable_background = "";
            var sort_class = "";
            var glyph_icon_sort = ""


            for (var a = 0; a < header_len; a++) {
                var data_table_head = data.table_header[a];
                if (data_table_head.visible == true) {

                    //check for sorting
                    if (data_table_head.sortable) {

                        if (data_table_head.asc == "asc") {
                            sort_class = "asc-sortable";
                            glyph_icon_sort = "";
                        } else {
                            sort_class = "dsc-sortable";
                            glyph_icon_sort = "-alt";
                        }

                        if (data.meta.hasOwnProperty("sort_field") && data.meta.sort_field == data_table_head.name) {
                            sortable_background = "style='background-color:yellow'";
                        }

                        sortable = data_table_head.title +
                            "<a href='javascript:void(0)' " + sortable_background +
                            "data-name='" + data_table_head.name + "' class='" +
                            sort_class + "'><span class='glyphicon glyphicon-sort-by-alphabet" + glyph_icon_sort + "'></span></a>";

                        sortable_background = "";

                    } else {
                        sortable = data_table_head.title;
                    }


                    //table head
                    header += "<th>" + sortable + "</th>";
                }

                //filter generator
                if (data_table_head.name != "Action") {

                    if (data_table_head.field_type == "number") {

                        if (data.meta.params[data_table_head.name + "[val]"] != undefined) {
                            val = data.meta.params[data_table_head.name + "[val]"];
                        }

                        filter_html += "<div class='filter-container'><label for='" + data_table_head.name + "' >" + data_table_head.title + "</label>"
                        filter_html += "<select class='selectbox form-control operator'>";
                        filter_html += "<option " + selected_maker(">", data, data_table_head.name) + " data-value='>'>&gt;</option>" +
                            "<option " + selected_maker("<", data, data_table_head.name) + " data-value='<'>&lt;</option>" +
                            "<option " + selected_maker(">=", data, data_table_head.name) + " data-value='>='>&gt=</option>" +
                            "<option " + selected_maker("<=", data, data_table_head.name) + " data-value='<='>&lt=</option>" +
                            "<option " + selected_maker("==", data, data_table_head.name) + " data-value='=='>=</option>" +
                            "<option " + selected_maker("!=", data, data_table_head.name) + " data-value='!='>!=</option>";

                        filter_html += "</select>";
                        filter_html += "<input value='" + filter_input_value_set(data, data_table_head.name) + "' type='number' class='form-control value' name='" + data_table_head.name + "' />";
                        filter_html += "</div>";
                    } else if (data_table_head.field_type == "text") {
                        filter_html += "<div class='filter-container'><label for='" + data_table_head.name + "' >" + data_table_head.title + "</label>";
                        filter_html += "<select class='selectbox form-control operator'>" +
                            "<option " + selected_maker("==", data, data_table_head.name) + " data-value='=='>=</option>" +
                            "<option " + selected_maker("like", data, data_table_head.name) + " data-value='like'>Like</option>" +
                            "<option " + selected_maker("not-like", data, data_table_head.name) + " data-value='not-like'>Not Like</option>" +
                            "<option " + selected_maker("!=", data, data_table_head.name) + " data-value='!='>!=</option>" +
                            "</select>";
                        filter_html += "<input value='" + filter_input_value_set(data, data_table_head.name) + "' type='text' class='form-control value' name='" + data_table_head.name + "' />";
                        filter_html += "</div>";
                    } else if (data_table_head.field_type == "date") {
                        filter_html += "<div class='filter-container'><label for='" + data_table_head.name + "' >" + data_table_head.title + "</label>";
                        filter_html += "<select class='selectbox form-control operator'>" +
                            "<option " + selected_maker("==", data, data_table_head.name) + " data-value='=='>=</option>" +
                            "<option " + selected_maker(">", data, data_table_head.name) + " data-value='>'>&gt;</option>" +
                            "<option " + selected_maker(">=", data, data_table_head.name) + " data-value='>='>&gt;=</option>" +
                            "<option " + selected_maker("<", data, data_table_head.name) + " data-value='<'>&lt;</option>" +
                            "<option " + selected_maker("<=", data, data_table_head.name) + " data-value='<='>&lt;=</option>" +
                            "<option " + selected_maker("like", data, data_table_head.name) + " data-value='like'>Like</option>" +
                            "<option " + selected_maker("not-like", data, data_table_head.name) + " data-value='not-like'>Not Like</option>" +
                            "<option " + selected_maker("!=", data, data_table_head.name) + " data-value='!='>!=</option>" +
                            "</select>";
                        filter_html += "<input onblur='the_sgrid.validateDateOnType(this)' placeholder='YYYY-MM-DD' value='" + filter_input_value_set(data, data_table_head.name) + "' type='text' class='form-control value' name='" + data_table_head.name + "' />";
                        filter_html += "</div>";
                    } else if (data_table_head.field_type == "bool") {
                        filter_html += "<div class='filter-container'><label for='" + data_table_head.name + "' >" + data_table_head.title + "</label>";
                        filter_html += "<select class='selectbox form-control operator'>" +
                            "<option " + selected_maker("==", data, data_table_head.name) + " data-value='=='>=</option>" +
                            "<option " + selected_maker("!=", data, data_table_head.name) + " data-value='!='>!=</option>" +
                            "</select>";
                        filter_html += "<input type='text' readonly='true' value='True' class='form-control value' name='" + data_table_head.name + "' />";
                        filter_html += "</div>";
                    } else if (data_table_head.field_type == "option") {
                        filter_html += "<div class='filter-container'><label for='" + data_table_head.name + "' >" + data_table_head.title + "</label>";
                        filter_html += "<select class='selectbox form-control operator'>" +
                            "<option " + selected_maker("==", data, data_table_head.name) + " data-value='=='>=</option>" +
                            "<option " + selected_maker("!=", data, data_table_head.name) + " data-value='!='>!=</option>" +
                            "</select>";
                        filter_html += "<select name='" + data_table_head.name + "' class='selectbox form-control value'>"
                        for (var o = 0; o < data_table_head.option.length; o++) {
                            var selected_dd = "";
                            if (data_table_head.option[o].Key == data.meta.params[data_table_head.name + "[val]"]) {
                                selected_dd = "selected='true'";
                            }
                            filter_html += "<option " + selected_dd + " data-value='" + data_table_head.option[o].Key + "'>" + data_table_head.option[o].Value + "</option>"
                        }
                        // filter_html += filter_html+="<input type='text' class='form-control' name='"+data_table_head.name+"' />";
                        filter_html += "</select></div>";
                    }
                }

            }

            //table body
            for (var b = 0; b < row_len; b++) {

                var td = "";

                for (var i = 0; i < data.value[b].length; i++) {
                    if (data.value[b][i].visible == true) {
                        td += "<td>" + data.value[b][i].value + "</td>";
                    }
                }
                tr = tr + "<tr>" + td + "</tr>";
            }

            tr += "<input type='hidden' class='sgrid-meta' value='" + JSON.stringify(data.meta) + "' />"

        } else if (data.hasOwnProperty("td")) {
            tr = "<td>" + data.td + "</td>";
        } else {
            tr = "<td>Seems something went wrong! Check Console. <a href='javascript:location.reload()'>Reload</a></td>";
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
                var start_page_html = "";
                var end_page_html = "";
                var page_start = current_page
                if (page_start > 1) {
                    page_start = page_start - 1;
                }
                var page_count = 0;
                for (var p = page_start; p <= total_pages; p++) {

                    page_count++;

                    var page_activate = ""
                    if (p == current_page) {
                        page_activate = "active"
                    }
                    if (total_pages != current_page) {
                        end_page_html = "<li><a class='glyphicon glyphicon-fast-forward' data-page='" + total_pages + "' href='javascript:void(0);'> </a></li>";
                    }
                    if (1 != current_page) {
                        start_page_html = "<li><a class='glyphicon glyphicon-fast-backward' data-page='1' href='javascript:void(0);'> </a></li>";
                    }
                    pages_html += "<li class='page-number " + page_activate + "'><a data-page='" + p + "' href='javascript:void(0);'>" + p.toString() + "</a></li>";
                    if (page_count == 10) {
                        break;
                    }
                }

                //for filter

                final_table = final_table + '<ul class="pagination">' + start_page_html + pages_html + end_page_html + '</ul>';

            }


        }

        filter_html = "<div class='sgrid filters'><div><label><a class='show_filters' href='javascript:void(0);'>Show Filters</a></label></div><div class='filter_items'>"+ filter_html +"";

        filter_html += "<div class='filter-container'><button class='start-filter form-control btn btn-primary btn-md'>Filter</button>"
        filter_html += "<button class='reset-filter form-control btn btn-primary btn-md'>Reset</button></div></div></div>";

        $(the_sgrid.table_id).html('<div class="sgrid-loader">Loading....</div>' + filter_html + final_table);
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
        the_sgrid.showFilters();
    },
    validateDateOnType:function (obj) {
        // alert(obj.value)
        if(obj.value.length>0&&!isValidDate(obj.value)){
            alert("Invalid Date format!\nCorrect format is YYYY-MM-DD.");
            obj.value = '';
            obj.focus()
        }
    },
    showFilters:function () {
        $(".show_filters").on('click', function () {
            //alert($(this).text());
            if($(this).text()=="Show Filters"){
                $(".filter_items").show();
                $(this).text("Hide Filters");
            }else{
                $(".filter_items").hide();
                $(this).text("Show Filters");
            }
        })
    }

}