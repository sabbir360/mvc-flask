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
        if (raw_meta !== undefined) {
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

            // prepare filter
            function trigger_filter() {

                var selector = $(the_sgrid.table_id + " .filter-container");

                // search query builder
                sortable_field = params.sort_field;

                selector.each(function (index, item) {
                    var name = $(item).find(".value").attr("name");

                    if (name != undefined) {
                        if (params.hasOwnProperty(name)) {
                            console.log("Deleting duplicate... " + name);
                            delete params[name];
                        }
                        /*console.log($(item).find(".operator option:selected").attr("data-value"));
                         console.log($(item).find(".value").val());*/
                        var operator = $(item).find(".operator option:selected").attr("data-value");
                        var value = $(item).find(".value").val();

                        if (operator !== undefined && value !== undefined) {
                            params[name] = {
                                op: operator,
                                val: value
                            }
                        }


                    }
                });

                trigger_ajax_call();
            }

            //filtering trigger
            $(the_sgrid.table_id + " .start-filter").click(function () {
                trigger_filter();
            });

            //delete trigger
            $(the_sgrid.table_id + " .grid_item_delete").on('click', function () {
                var delete_confirm = confirm("Are you sure about deleting this record?");
                if (delete_confirm == true) {
                    $(the_sgrid.table_id + " .sgrid-loader").show();
                    var url = $(this).attr("data-url");
                    var id = $(this).attr("data-id");
                    $.post(url, {model_id: id}).done(function (data) {

                        if (data.status && data.status == 1) {
                            $(the_sgrid.table_id + " .sgrid-loader").hide();
                            sortable_field = params.sort_field;
                            trigger_ajax_call();
                            alert(data.message);
                        } else {
                            alert(data.message);
                            $(the_sgrid.table_id + " .sgrid-loader").hide();
                        }
                    }).fail(function () {
                        alert("Delete call failed. Contact support for more info.");
                        $(the_sgrid.table_id + " .sgrid-loader").hide();
                    });
                }
                // trigger_filter();

            });

            // reset search filters
            $(the_sgrid.table_id + " .reset-filter").click(function () {
                window.location.reload();
            });

            // this will call filter by gathering available params
            function trigger_ajax_call() {

                params.sort_field = sortable_field;
                _sort_back_color_grid = sortable_field;
                the_sgrid.loadData(meta.url, params);
                // _trigger_ajax_call_grid=false;

            }

            // set operator and value, for each filter result.
            // combo box
            var prev_select = "";

            $(the_sgrid.table_id + " .operator").on('focus', function () {
                prev_select = $(this).find("option:selected");
            }).change(function () {
                var  item_name = $(this).parent().parent().find(".value").attr("name");
                // params[$(this).parent().find(".value").attr("name") + "[op]"] = $(this).find("option:selected").attr("data-value");
                params[item_name + "[op]"] = $(this).find("option:selected").attr("data-value");
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
        var filter_top_section_html = "";
        //alert(JSON.stringify(data.meta.params))
        // combo box select marker
        function selected_maker(operator, data, name) {

            if (data.meta.params.hasOwnProperty(name + "[op]")) {

                if (operator == data.meta.params[name + "[op]"]) {
                    return "selected='true'";
                }
            }


            return "";
        }

        // filter input value set
        function filter_input_value_set(data, name) {

                if (data.meta.params[name + "[val]"] != undefined) {
                    return data.meta.params[name + "[val]"]
                }


            return "";
        }

        if (data.hasOwnProperty("value")) {

            var header_len = data.table_header.length;
            // console.log(data.value)
            var row_len = data.value.length;
            var sortable = "";
            var sortable_background = "";
            var sort_class = "";
            var glyph_icon_sort = "";
            var row_counter = 0;
            var close_div = false;


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
                    if (row_counter == 0) {
                        filter_html += "<div class='row'>";

                    }
                    row_counter++;
                    if (row_counter == 3) {
                        close_div = true;
                        row_counter = 0;
                    }
                    filter_html += "<div class='col-sm-4'>";
                    if (data_table_head.field_type == "number") {

                        filter_html += "<div class='filter-container row'>" +
                            "<div><label for='" + data_table_head.name + "' >" + data_table_head.title + "</label></div>";

                        filter_html += "<div class='col-sm-6 filter-adjuster'><select class='selectbox form-control operator'>";
                        filter_html += "<option " + selected_maker(">", data, data_table_head.name) + " data-value='>'>&gt;</option>" +
                            "<option " + selected_maker("<", data, data_table_head.name) + " data-value='<'>&lt;</option>" +
                            "<option " + selected_maker(">=", data, data_table_head.name) + " data-value='>='>&gt;=</option>" +
                            "<option " + selected_maker("<=", data, data_table_head.name) + " data-value='<='>&lt;=</option>" +
                            "<option " + selected_maker("==", data, data_table_head.name) + " data-value='=='>=</option>" +
                            "<option " + selected_maker("!=", data, data_table_head.name) + " data-value='!='>!=</option>";

                        filter_html += "</select></div>";
                        filter_html += "<div class='col-sm-6 input-filter-adjuster'> <input value='" + filter_input_value_set(data, data_table_head.name) + "' type='number' class='form-control value' name='" + data_table_head.name + "' /></div>";
                        filter_html += "</div>";
                    } else if (data_table_head.field_type == "text") {
                        filter_html += "<div class='filter-container row'><div><label for='" + data_table_head.name + "' >" + data_table_head.title + "</label></div>";
                        filter_html += "<div class='col-sm-6 filter-adjuster'><select class='selectbox form-control operator'>" +
                            "<option " + selected_maker("==", data, data_table_head.name) + " data-value='=='>=</option>" +
                            "<option " + selected_maker("like", data, data_table_head.name) + " data-value='like'>Like</option>" +
                            "<option " + selected_maker("not-like", data, data_table_head.name) + " data-value='not-like'>Not Like</option>" +
                            "<option " + selected_maker("!=", data, data_table_head.name) + " data-value='!='>!=</option>" +
                            "</select></div>";
                        filter_html += "<div class='col-sm-6 input-filter-adjuster'><input value='" + filter_input_value_set(data, data_table_head.name) + "' type='text' class='form-control value' name='" + data_table_head.name + "' />";
                        filter_html += "</div></div>";
                    } else if (data_table_head.field_type == "date") {
                        filter_html += "<div class='filter-container row'><div><label for='" + data_table_head.name + "' >" + data_table_head.title + "</label></div>";
                        filter_html += "<div class='col-sm-6 filter-adjuster'><select class='selectbox form-control operator'>" +
                            "<option " + selected_maker("==", data, data_table_head.name) + " data-value='=='>=</option>" +
                            "<option " + selected_maker(">", data, data_table_head.name) + " data-value='>'>&gt;</option>" +
                            "<option " + selected_maker(">=", data, data_table_head.name) + " data-value='>='>&gt;=</option>" +
                            "<option " + selected_maker("<", data, data_table_head.name) + " data-value='<'>&lt;</option>" +
                            "<option " + selected_maker("<=", data, data_table_head.name) + " data-value='<='>&lt;=</option>" +
                            "<option " + selected_maker("like", data, data_table_head.name) + " data-value='like'>Like</option>" +
                            "<option " + selected_maker("not-like", data, data_table_head.name) + " data-value='not-like'>Not Like</option>" +
                            "<option " + selected_maker("!=", data, data_table_head.name) + " data-value='!='>!=</option>" +
                            "</select></div>";
                        filter_html += "<div class='col-sm-6 input-filter-adjuster'><input onblur='the_sgrid.validateDateOnType(this)' placeholder='YYYY-MM-DD' value='" + filter_input_value_set(data, data_table_head.name) + "' type='text' class='form-control value' name='" + data_table_head.name + "' />";
                        filter_html += "</div></div>";
                    } else if (data_table_head.field_type == "bool") {
                        filter_html += "<div class='filter-container row'><div><label for='" + data_table_head.name + "' >" + data_table_head.title + "</label></div>";
                        filter_html += "<div class='col-sm-6 filter-adjuster'><select class='selectbox form-control operator'>" +
                            "<option " + selected_maker("==", data, data_table_head.name) + " data-value='=='>=</option>" +
                            "<option " + selected_maker("!=", data, data_table_head.name) + " data-value='!='>!=</option>" +
                            "</select></div>";
                        filter_html += "<div class='col-sm-6 input-filter-adjuster'></div><input type='text' readonly='true' value='True' class='form-control value' name='" + data_table_head.name + "' />";
                        filter_html += "</div></div>";
                    } else if (data_table_head.field_type == "option") {
                        filter_html += "<div class='filter-container row'><div><label for='" + data_table_head.name + "' >" + data_table_head.title + "</label></div>";
                        filter_html += "<div class='col-sm-6 filter-adjuster'><select class='selectbox form-control operator'>" +
                            "<option " + selected_maker("==", data, data_table_head.name) + " data-value='=='>=</option>" +
                            "<option " + selected_maker("!=", data, data_table_head.name) + " data-value='!='>!=</option>" +
                            "</select></div>";
                        filter_html += "<div class='col-sm-6'><select name='" + data_table_head.name + "' class='selectbox form-control value'>"
                        for (var o = 0; o < data_table_head.option.length; o++) {
                            var selected_dd = "";
                            if (data_table_head.option[o].Key == data.meta.params[data_table_head.name + "[val]"]) {
                                selected_dd = "selected='true'";
                            }
                            filter_html += "<option " + selected_dd + " data-value='" + data_table_head.option[o].Key + "'>" + data_table_head.option[o].Value + "</option>"
                        }
                        // filter_html += filter_html+="<input type='text' class='form-control' name='"+data_table_head.name+"' />";
                        filter_html += "</select></div></div>";
                    }
                    filter_html += "</div>";
                    if (close_div) {
                        filter_html += "</div>";
                        close_div = false;
                    }
                }

            }

            //table body
            for (var b = 0; b < row_len; b++) {

                var td = "";
                // console.log(data.value[b])
                for (var i = 0; i < data.value[b].length; i++) {
                    // console.log(data.value[b][i].visible)
                    if (data.value[b][i].visible === true) {

                        td += "<td>" + data.value[b][i].value + "</td>";

                    } else if (data.value[b][i].visible == "Action") {
                        var id = data.value[b][i].value;
                        var href = location.href.replace(/#/, "");
                        var url = location.href + "/" + id + "/edit";
                        var action_html = "<a href='" + url + "'><span class='glyphicon glyphicon-pencil'></span></a>";
                        url = location.href + "/" + id + "/delete";
                        action_html += " | <a class='grid_item_delete' data-id='" + id + "' data-url='" + url + "' href='javascript:void()'><span class='glyphicon glyphicon-trash'></span></a>";
                        td += "<td>" + action_html + "</td>";
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
                        end_page_html = "<li><a class='glyphicon glyphicon-fast-forward' style='top: 0' data-page='" + total_pages + "' href='javascript:void(0);'> </a></li>";
                    }
                    if (1 != current_page) {
                        start_page_html = "<li><a class='glyphicon glyphicon-fast-backward' style='top: 0' data-page='1' href='javascript:void(0);'> </a></li>";
                    }
                    pages_html += "<li class='page-number " + page_activate + "'><a data-page='" + p + "' href='javascript:void(0);'>" + p.toString() + "</a></li>";
                    if (page_count == 10) {
                        break;
                    }
                }

                //for filter

                final_table = final_table + '<div class="container"><div class="col-md-8 text-left"><ul class="pagination" style="margin: 0">' + start_page_html + pages_html + end_page_html + '</ul>';
                final_table = final_table + "</div><div class='col-md-4 text-right'>Showing page <span class='badge'>" + current_page + " </span> of <span class='badge'>" + total_pages + "</span> | Total records <span class='badge'>" + total_rows + "</span></div></div>";
            }


        }

        filter_top_section_html = "<div>" +
            "<label><a class='show_filters' href='javascript:void(0);' data-attr='show'><span class='glyphicon glyphicon-filter'></span>&nbsp;Show Filters</a></label>" +
            "&nbsp;&nbsp;<label><a class='add_new' href='#'><span class='glyphicon glyphicon-plus-sign'></span>&nbsp;Add</a></label>" +
            "</div>";
        filter_html = "<div class='sgrid filters'>" + filter_top_section_html + "<div class='filter_items container'>" + filter_html + "";
        //filter_html = "<div class='sgrid filters'><div><label><a class='show_filters' data-attr='show' href='javascript:void(0);'>Show Filters</a></label></div><div class='filter_items'>" + filter_html + "";
        filter_html += "<div class='filter-container row'><div class='col-sm-6'><button class='start-filter form-control btn btn-primary btn-md'><span class='glyphicon glyphicon-search'></span>&nbsp;Filter</button></div>"
        filter_html += "<div class='col-sm-6'><button class='reset-filter form-control btn btn-primary btn-md'><span class='glyphicon glyphicon-refresh'></span>&nbsp;Reset</button></div></div></div>";

        $(the_sgrid.table_id).html('<div class="sgrid-loader">Loading....</div>' + filter_html + final_table);
        the_sgrid.initialize();
        $(the_sgrid.table_id + " .sgrid-loader").hide();

        // show filter initialization
        the_sgrid.showFilters();

        //add new url
        $(the_sgrid.table_id + " .add_new").attr("href", location.href + "/add");
    },
    validateDateOnType: function (obj) {

        if (obj.value.length > 0 && !isValidDate(obj.value)) {
            alert("Invalid Date format!\nCorrect format is YYYY-MM-DD.");
            obj.value = '';
            obj.focus()
        }
    },
    showFilters: function () {
        $(the_sgrid.table_id + " .show_filters").on('click', function () {
            if ($(this).attr('data-attr') == "show") {
                $(the_sgrid.table_id + " .filter_items").show();
                $(this).attr("data-attr", "hide");
            } else {
                $(the_sgrid.table_id + " .filter_items").hide();
                $(this).attr("data-attr", 'show');
            }
        });
    },

}