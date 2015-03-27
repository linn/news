'use strict';

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery', 'bootstrap'], factory);
    } else {
        factory(jQuery);
    }
} (function ($) {
    // small helper function to pull out a link href based on it's 'rel' value, usage: rel(thing.links, 'relName');
    var rel = function (links, rel) {
        return $.grep(links, function (l) { return l.rel == rel; })[0].href;
    };

    var sanitise = function (content) {
        var sanitised = content.replace(/<img[^>]*>/g, ""); // strip out img tags to prevent browser downloading them

        return $('<span>' + sanitised + '</span>').text().trim();
    };

    var ordinal = function (date) {
        var day = date.getDate();
        var d = day % 10;

        return (~ ~(day % 100 / 10) === 1) ? 'th' :
            (d === 1) ? 'st' :
            (d === 2) ? 'nd' :
            (d === 3) ? 'rd' : 'th';
    };

    var monthName = function (date) {
        var months = new Array('Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec');

        return months[date.getMonth()];
    };

    var cookie = function (key, value) {
        // set
        if (value) {
            document.cookie = key + '=' + value;
            return;
        }

        // get
        var pairs = document.cookie.split(';');

        for (var i = 0; i < pairs.length; i++) {
            var name = pairs[i].split('=')[0];

            if (name == key) {
                return pairs[i].split('=')[1];
            }
        }
    };

    $(function () {
        var script, settings;

        var $script = $('script[src$="kaboom.js"]');
        var root = '';
        var dataSection = '';

        if ($script.size()) {
            if ($script.data('root')) {
                root = $script.data('root');
            }

            if ($script.data('section')) {
                dataSection = $script.data('section');
            }
        }

        /* KABOOM CLASS DEFINITION
        * ====================== */

        var Kaboom = function (element, options) {
            this.$element = $(element);
            this.options = $.extend({ section: dataSection }, options, this.$element.data());
        };

        Kaboom.prototype = {
            initialize: function () {
                this.$element.prepend(
                    '<header class="navbar navbar-inverse navbar-fixed-top shadow kb-navbar">' +
                        '<div class="container">' +
                            '<div class="navbar-header">' +
                                '<button type="button" class="navbar-toggle" data-toggle="collapse" data-target="#kb-collapse">' +
                                    '<span class="sr-only">Toggle navigation</span>' +
                                    '<span class="icon-bar"></span>' +
                                    '<span class="icon-bar"></span>' +
                                    '<span class="icon-bar"></span>' +
                                '</button>' +
                                '<img class="navbar-brand visible-xs" src="' + root + '/Content/images/linn-sm.png" />' +
                            '</div>' +
                            '<div class="collapse navbar-collapse" id="kb-collapse">' +
                                '<ul class="nav navbar-nav"></ul>' +
                                '<ul class="nav navbar-nav navbar-right">' +
                                    '<li><a href="#info" data-toggle="kaboom"><i class="glyphicon glyphicon-info-sign"></i></a></li>' +
                                    '<li class="dropdown" id="my-stuff">' +
                                        '<a href="#" class="dropdown-toggle" data-toggle="dropdown"><span class="username"></span> <b class="caret"></b></a>' +
                                        '<ul class="dropdown-menu"></ul>' +
                                    '</li>' +
                                '</ul>' +
                            '</div>' +
                        '</div>' +
                    '</header>' +
                    '<div class="env"></div>');

                if (window.location.host.indexOf('localhost') == 0) {
                    this.$element.find('.env').append('<span class="label label-primary">Local Testing</span>');
                } else if (window.location.host.indexOf('app-int') == 0) {
                    this.$element.find('.env').append('<span class="label label-success">Integration Testing</span>');
                } else if (window.location.host.indexOf('app-sys') == 0) {
                    this.$element.find('.env').append('<span class="label label-warning">System Testing</span>');
                }
            },

            load: function () {
                var self = this;

                $.ajax({
                    dataType: "json",
                    url: root + '/intranet/menu',
                    accepts: {
                        json: 'application/vnd.linn.intranet-menu+json; version=1, application/vnd.linn.intranet-menu+json'
                    }
                }).done(function (menu) {
                    self.render(menu);
                });
            },

            render: function (menu) {
                var $nav = this.$element.find('.navbar-collapse .nav').first();
                var self = this;
                var info;

                $.each(menu.sections, function (i, section) {
                    if (section.id == 'info') {
                        info = section;

                        return; // we will deal with Info as a special case
                    }

                    if (section.id == self.options.section) {
                        $nav.append('<li class="always-active"><a href="#' + section.id + '" data-toggle="kaboom">' + section.title + '</a></li>');
                    } else {
                        $nav.append('<li><a href="#' + section.id + '" data-toggle="kaboom">' + section.title + '</a></li>');
                    }
                    var $kaboom = $(
                        '<div class="kaboom" id="' + section.id + '">' +
                            '<div class="container">' +
                                '<div class="row">' +
                                    '<div class="col-sm-3 dark">' +
                                        '<ul class="nav nav-list">' +
                                            '<li class="nav-header nav-header-dark"><span class="hidden-xs">Most Used</span><span class="visible-xs">' + section.title + '</span></li>' +
                                        '</ul>' +
                                    '</div>' +
                                    '<div class="col-sm-9">' +
                                        '<div class="row kb-cols"></div>' +
                                        '<div class="row landing-row">' +
                                            '<div class="col-sm-12"><a href="' + rel(section.links, 'landing') + '" class="muted pull-right">Show all options...</a></div>' +
                                        '</div>' +
                                    '</div>' +
                                '</div>' +
                            '</div>' +
                        '</div>');
                    var $mostUsed = $kaboom.find('.nav').first();
                    var $columns = $kaboom.find('.col-sm-9 .row').first();

                    for (var j = 0; j < 4; j++) {
                        var $column = $('<div class="col-sm-3 hidden-xs"><ul class="nav nav-list"></ul></div>');

                        if (j < section.columns.length) {
                            var column = section.columns[j];

                            $.each(column.categories, function (k, category) {
                                $column.find('.nav').append('<li class="nav-header">' + category.title + '</li>');

                                $.each(category.items, function (l, item) {
                                    if (item.showInMenu) {
                                        $column.find('.nav').append('<li><a href="' + item.href + '">' + item.title + '</a></li>');
                                    }
                                });
                            });
                        }

                        $columns.append($column);
                    }

                    $.each(section.mostUsed.categories, function (m, category) {
                        $mostUsed.append('<li class="nav-header">' + category.title + '</li>');

                        $.each(category.items, function (l, item) {
                            $mostUsed.append('<li><a href="' + item.href + '">' + item.title + '</a></li>');
                        });
                    });

                    self.$element.find('.navbar').first().after($kaboom);
                });

                var $info = $(
                    '<div class="kaboom" id="info">' +
                        '<div class="container">' +
                            '<div class="row">' +
                                '<div class="col-sm-9 hidden-xs kb-cols">' +
                                    '<div class="row"></div>' +
                                    '<div class="row news-and-stats">' +
                                        '<div class="col-sm-6 news" data-style="compact"></div>' +
                                        '<div class="col-sm-6 statistics" data-style="compact"></div>' +
                                    '</div>' +
                                    '<div class="row landing-row">' +
                                        '<div class="col-sm-12"><a href="' + rel(info.links, 'landing') + '" class="muted pull-right">Show all options...</a></div>' +
                                    '</div>' +
                                '</div>' +
                                '<div class="col-sm-3 dark">' +
                                    '<ul class="nav nav-list">' +
                                        '<li class="nav-header nav-header-dark"><span class="hidden-xs">Most Used</span><span class="visible-xs">Information &amp; Help</span></li>' +
                                        '<li class="nav-header">IT Support</li>' +
                                        '<li class="dark"><a href="mailto:it.support@linn.co.uk"><i class="glyphicon glyphicon-envelope"></i> it.support@linn.co.uk</a></li>' +
                                        '<li><i class="glyphicon glyphicon-earphone"></i> 5123</li>' +
                                        '<li><div><a href="mailto:it.support@linn.co.uk" class="btn btn-primary" style="margin: 8px 0 8px 0;">Email Support</a>&nbsp;' +
                                                 '<a href="http://pchelpdesk.linn.co.uk/" class="btn btn-primary" style="margin: 8px 0 8px 0;">Visit Helpdesk</a></div></li>' +
                                    '</ul>' +
                                '</div>' +
                                '<div class="row landing-row visible-xs">' +
                                    '<div class="col-sm-12"><a href="' + rel(info.links, 'landing') + '" class="muted pull-right">Show all options...</a></div>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                    '</div>');
                var $columns = $info.find('.col-sm-9 .row').first();
                var $mostUsed = $info.find('.nav').last();

                $info.find('.news').news();
                $info.find('.statistics').sales();

                for (var j = 0; j < 4; j++) {
                    var $column = $('<div class="col-sm-3"><ul class="nav nav-list"></ul></div>');

                    if (j < info.columns.length) {
                        var column = info.columns[j];

                        $.each(column.categories, function (k, category) {
                            $column.find('.nav').append('<li class="nav-header">' + category.title + '</li>');

                            $.each(category.items, function (l, item) {
                                if (item.showInMenu) {
                                    $column.find('.nav').append('<li><a href="' + item.href + '">' + item.title + '</a></li>');
                                }
                            });
                        });
                    }

                    $columns.append($column);
                }

                $.each(info.mostUsed.categories, function (m, category) {
                    $mostUsed.append('<li class="nav-header">' + category.title + '</li>');

                    $.each(category.items, function (l, item) {
                        $mostUsed.append('<li><a href="' + item.href + '">' + item.title + '</a></li>');
                    });
                });

                self.$element.find('.navbar').first().after($info);

                var $myStuff = this.$element.find('#my-stuff');
                var $myStuffMenu = $myStuff.find('.dropdown-menu');

                $myStuff.find('.username').text(menu.myStuff.userName);

                $.each(menu.myStuff.groups, function (i, group) {
                    $.each(group.items, function (j, item) {
                        var href;

                        if (item.href.indexOf('mailto:') == 0) {
                            href = item.href;
                        } else {
                            href = root + item.href;
                        }

                        var icon = '';

                        if (item.icon) {
                            icon = ' <i class="icon-' + item.icon + '"></i>';
                        }

                        $myStuffMenu.append('<li><a href="' + href + '">' + item.title + icon + '</a></li>');
                    });

                    if (i < menu.myStuff.groups.length - 1) {
                        $myStuffMenu.append('<li class="divider"></li>');
                    }
                });
            },

            toggle: function (target) {
                var $target = $(target);
                var $parent = $target.parent();
                var $navbar = $target.closest('.kb-navbar');
                var $collapse = $navbar.find('#kb-collapse.in');
                var $kaboom = $('.kaboom');
                var id = $target.attr('href');
                $navbar.find('.nav li').removeClass('active');
                $navbar.addClass('shadow');

                if (id != '#') { // ??
                    var $id = $(id);
                    $kaboom.not(id).hide();
                    $id.toggle();
                    $collapse.collapse('hide');

                    if ($id.is(':visible')) {
                        $parent.addClass('active');
                        $navbar.removeClass('shadow');
                    }
                } else {
                    $navbar.find('.nav li').removeClass('active');
                    $navbar.addClass('shadow');
                    $kaboom.hide();
                }

                $navbar.find('#my-stuff').removeClass('open');
            }
        };

        function hideKabooms() {
            var $navbar = $('.navbar').eq(0);
            var $kaboom = $('.kaboom');

            $navbar.find('.nav li').removeClass('active');
            $navbar.addClass('shadow');
            $kaboom.hide();
        };

        /* KABOOM PLUGIN DEFINITION
        * ======================== */

        $.fn.kaboom = function (option, target) {
            return this.each(function () {
                var $this = $(this);
                var data = $this.data('kaboom');
                var options = typeof option == 'object' && option;
                if (!data) {
                    $this.data('kaboom', (data = new Kaboom(this, options)));
                    data.initialize();
                    data.load();
                };

                if (typeof option == 'string') { data[option].call($this, target); };
            });
        };

        $.fn.kaboom.Constructor = Kaboom;


        /* KABOOM DATA-API
        * =============== */

        $('body').each(function () {
            var $this = $(this);
            var options = $.extend({}, $this.data());

            $this.kaboom(options);
        });

        $(document).on('click', '[data-toggle^=kaboom]', function (e) {
            $('body').kaboom('toggle', this);

            e.preventDefault();
            e.stopPropagation();
        });

        $(document).on('click', '.navbar [data-toggle^=dropdown]', hideKabooms);
        $(document).on('click', '.kaboom', function (e) { e.stopPropagation(); });
        $(document).on('click', hideKabooms);


        /* NEWS CLASS DEFINITION
        * ====================== */
        var News = function (element, options) {
            this.$element = $(element);
            this.options = $.extend({}, $.fn.news.defaults, options, this.$element.data());
        };

        News.prototype = {
            truncate: function (s, n) {
                var toLong = s.length > n,
                    s_ = toLong ? s.substr(0, n - 1) : s;
                s_ = toLong ? s_.substr(0, s_.lastIndexOf(' ')) : s_;
                return toLong ? s_ + '&hellip;' : s_;
            },

            load: function () {
                var self = this;

                $.ajax({
                    dataType: 'json',
                    url: root + '/news?count=' + this.options.count,
                    accepts: {
                        json: 'application/vnd.linn.news+json; version=1, application/vnd.linn.news+json'
                    }
                }).done(function (news) {
                    self.render(news);
                });
            },

            render: function (news) {
                this.$element.empty();
                var self = this;

                if (this.options.style == 'default') {
                    this.$element.append('<h4>Company News</h4>');
                } else {
                    this.$element.append('<ul class="nav nav-list"><li class="nav-header">News</li></ul>');
                }

                $.each(news.posts, function (i, post) {
                    var href = rel(post.links, 'self');
                    var label = '';

                    if (post.labels.length) {
                        // only support displaying the first label
                        label = '<span class="label label-' + post.labels[0] + '">' + post.labels[0] + '</span>';
                    }

                    if (self.options.style == 'default') {
                        var $post = $('<div class="row news-item"><div class="col-sm-9"></div><div class="col-sm-3"></div></div>');

                        if (href) {
                            $post.find('.col-sm-9').append('<a href="' + href + '">' + post.title + label + '</a>');
                        } else {
                            $post.find('.col-sm-9').append('<a>' + post.title + label + '</a>');
                        }

                        $post.find('.col-sm-9').append('<p>' + self.truncate(sanitise(post.content), self.options.truncate) + '</p>');

                        var created = new Date(parseInt(post.created.substr(6)));
                        var formatted = created.getDate() + ordinal(created) + ' ' + monthName(created) + ' ' + created.getFullYear();

                        $post.find('.col-sm-3')
                            .append('<p class="muted pull-right">' + formatted + '</p>');

                        self.$element.append($post);
                    } else {
                        var $post;
                        if (href) {
                            $post = $('<li class="news-item"><a href="' + href + '">' + post.title + label + '</a></li>');
                        } else {
                            $post = $('<li class="news-item"><a>' + post.title + label + '</a></li>');
                        }

                        self.$element.find('ul').append($post);
                    }
                });

                if (rel(news.links, 'all')) {
                    if (self.options.style == 'default') {
                        self.$element.append('<div class="row"><div class="col-sm-12"><a href="' + rel(news.links, 'all') + '">See all News...</a></div></div>');
                    } else {
                        self.$element.find('ul').append('<li><a href="' + rel(news.links, 'all') + '">See all News...</a></li>');
                    }
                }
            }
        };


        /* NEWS PLUGIN DEFINITION
        * ======================== */

        $.fn.news = function (option) {
            return this.each(function () {
                var $this = $(this);
                var data = $this.data('news');
                var options = typeof option == 'object' && option;
                if (!data) {
                    $this.data('news', (data = new News(this, options)));
                };

                data.load();
            });
        };

        $.fn.news.defaults = {
            style: 'default',
            truncate: 100,
            count: 5
        };

        $.fn.news.Constructor = News;


        /* NEWS DATA-API
        * =============== */

        $('.news').each(function () {
            var $this = $(this);
            var options = $.extend({}, $this.data());

            $this.news(options);
        });


        /* SALES CLASS DEFINITION
        * ====================== */
        var Sales = function (element, options) {
            this.$element = $(element);
            this.options = $.extend({}, $.fn.sales.defaults, options, this.$element.data());
        };

        Sales.prototype = {
            load: function () {
                var self = this;

                $.ajax({
                    dataType: 'json',
                    url: root + '/sales/summary',
                    accepts: {
                        json: 'application/vnd.linn.sales-summary+json; version=1, application/vnd.linn.sales-summary+json'
                    }
                }).done(function (stats) {
                    self.render(stats);
                });
            },

            format: function (x) {
                return Math.round(x).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            },

            render: function (stats) {
                this.$element.empty();

                if (this.options.style == 'default') {
                    this.$element.append('<h4>' + stats.month + ' Sales</h4>');
                } else {
                    this.$element.append('<ul class="nav nav-list"><li class="nav-header">Statistics</li></ul>');
                }

                var $table = $(
                    '<table class="table table-condensed">' +
                        '<thead>' +
                            '<tr>' +
                                '<th>Sales</th>' +
                                '<th>Products</th>' +
                                '<th>Records</th>' +
                            '</tr>' +
                        '</thead>' +
                        '<tbody>' +
                            '<tr>' +
                                '<td>Today</td>' +
                                '<td class="products-today"></td>' +
                                '<td class="records-today"></td>' +
                            '</tr>' +
                            '<tr>' +
                                '<td>This Month</td>' +
                                '<td class="products-mtd"></td>' +
                                '<td class="records-mtd"></td>' +
                            '</tr>' +
                            '<tr>' +
                                '<td>Orders</td>' +
                                '<td class="products-orders"></td>' +
                                '<td class="records-orders"></td>' +
                            '</tr>' +
                            '<tr>' +
                                '<td>Against Target</td>' +
                                '<td class="products-against-target"></td>' +
                                '<td class="records-against-target"></td>' +
                            '</tr>' +
                        '</tbody>' +
                        '<tfoot>' +
                            '<tr>' +
                                '<td></td>' +
                                '<td><a class="products-details">Details...</a></td>' +
                                '<td><a class="records-details">Details...</a></td>' +
                            '</tr>' +
                        '</tfoot>' +
                    '</table>');
                $table.find('.products-today').html(this.format(stats.linn.today));
                $table.find('.products-orders').html(this.format(stats.linn.orders));
                $table.find('.products-mtd').html(this.format(stats.linn.monthToDate));
                $table.find('.products-against-target').html(this.format(stats.linn.againstTarget));
                $table.find('.products-details').attr('href', rel(stats.linn.links, 'details'));

                if (stats.linn.againstTarget >= 0) {
                    $table.find('.products-against-target')
                    .addClass('over-target')
                    .prepend('+');
                } else {
                    $table.find('.products-against-target').addClass('under-target');
                }

                $table.find('.records-today').html(this.format(stats.records.today));
                $table.find('.records-orders').html(this.format(stats.records.orders));
                $table.find('.records-mtd').html(this.format(stats.records.monthToDate));
                $table.find('.records-against-target').html(this.format(stats.records.againstTarget));
                $table.find('.records-details').attr('href', rel(stats.records.links, 'details'));

                if (stats.records.againstTarget >= 0) {
                    $table.find('.records-against-target')
                    .addClass('over-target')
                    .prepend('+');
                } else {
                    $table.find('.records-against-target').addClass('under-target');
                }

                this.$element.append($table);
            }
        };


        /* SALES PLUGIN DEFINITION
        * ======================== */

        $.fn.sales = function (option) {
            return this.each(function () {
                var $this = $(this);
                var data = $this.data('sales');
                var options = typeof option == 'object' && option;
                if (!data) {
                    $this.data('sales', (data = new Sales(this, options)));
                };

                data.load();
            });
        };

        $.fn.sales.defaults = {
            style: 'default'
        };

        $.fn.sales.Constructor = Sales;


        /* SALES DATA-API
        * =============== */

        $('.statistics').each(function () {
            var $this = $(this);
            var options = $.extend({}, $this.data());

            $this.sales(options);
        });


        /* TICKER CLASS DEFINITION
        * ====================== */
        var Ticker = function (element) {
            this.$element = $(element);
            this.notifications = [];
            this.index = 0;
        };

        Ticker.prototype = {
            load: function () {
                if (cookie('ticker') == 'dismissed') {
                    return;
                }

                var self = this;

                $.ajax({
                    dataType: 'json',
                    url: root + '/notifications',
                    accepts: {
                        json: 'application/vnd.linn.notifications+json; version=1, application/vnd.linn.notifications+json'
                    }
                }).done(function (response) {
                    self.notifications = response.notifications;
                    self.render();
                });
            },

            render: function () {
                if (!this.notifications.length) {
                    return;
                }

                this.$element.empty();

                var notification = this.notifications[this.index];
                var label;

                if (notification.labels.length) {
                    // only support displaying the first label
                    label = '<span class="label label-default label-' + notification.labels[0] + '">' + notification.labels[0] + '</span>';
                } else {
                    label = '<span class="label label-default"></span>';
                }

                this.$element.append(
                    '<div class="ticker-notification col-xs-10">' +
                        '<div class="col-xs-10">' +
                            label +
                            '<span class="notification-title">' + notification.title + '</span>' +
                            '<span class="notification-content muted">' + sanitise(notification.content) + '</span>' +
                        '</div>' +
                        '<div class="col-xs-2">' +
                            '<a href="' + rel(notification.links, 'self') + '">Read More</a>' +
                        '</div>' +
                    '</div>' +
                    '<div class="col-xs-2 ticker-opts text-right">' +
                        '<a href="#" class="previous-notification"><i class="glyphicon glyphicon-chevron-left" /></a>' +
                        '<a href="#" class="next-notification"><i class="glyphicon glyphicon-chevron-right" /></a>' +
                        '<a href="#" class="dismiss-notifications"><i class="glyphicon glyphicon-remove"/></a>' +
                    '</div>');

                var self = this;

                this.$element.find('.dismiss-notifications').click(function () { self.close(); return false; });

                if (this.notifications.length > 1) {
                    this.$element.find('.previous-notification').click(function () { self.previous(); return false; });
                    this.$element.find('.next-notification').click(function () { self.next(); return false; });
                } else {
                    this.$element.find('.previous-notification, .next-notification').remove();
                }

                if (cookie('ticker') == 'shown') {
                    this.scheduleCycle();
                } else {
                    this.$element.find('.previous-notification, .next-notification, .dismiss-notifications, .ticker-notification').hide();

                    setTimeout(function () {
                        cookie('ticker', 'shown');
                        self.$element.find('.previous-notification, .next-notification, .dismiss-notifications, .ticker-notification').fadeIn(function () { self.scheduleCycle(); });
                    }, 1000);
                }
            },

            scheduleCycle: function () {
                if (this.notifications.length < 2) {
                    return;
                }

                var self = this;
                this._timeout = setTimeout(function () { self.next(); }, 8000);
            },

            reset: function () {
                if (this._timeout) {
                    clearTimeout(this._timeout);
                }
            },

            next: function () {
                if (this.index < this.notifications.length - 1) {
                    this.index++;
                } else {
                    this.index = 0;
                }

                this.cycle();
            },

            previous: function () {
                if (this.index > 0) {
                    this.index--;
                } else {
                    this.index = this.notifications.length - 1;
                }

                this.cycle();
            },

            cycle: function () {
                this.reset();

                var self = this;

                this.$element.find('.ticker-notification').fadeOut(function () {
                    var notification = self.notifications[self.index];
                    var $notification = self.$element.find('.ticker-notification');
                    var $label = self.$element.find('.label');
                    $notification.find('.notification-title').text(notification.title);
                    $notification.find('.notification-content').text(sanitise(notification.content));
                    self.$element.find('a:contains(Read More)').attr('href', rel(notification.links, 'self'));
                    $label.removeClass() // removes all classes
                        .addClass('label')
                        .addClass('label-default')
                        .text('');

                    if (notification.labels.length) {
                        var label = notification.labels[0];

                        // only support displaying the first label
                        $label.addClass('label-' + label).text(label);
                    }

                    $notification.fadeIn(function () { self.scheduleCycle(); });
                });
            },

            close: function () {
                this.reset();
                this.$element.fadeTo(400, 0);
                cookie('ticker', 'dismissed');
            }
        };


        /* TICKER PLUGIN DEFINITION
        * ======================== */

        $.fn.ticker = function () {
            return this.each(function () {
                var $this = $(this);
                var data = $this.data('ticker');
                if (!data) {
                    $this.data('ticker', (data = new Ticker(this)));
                };

                data.load();
            });
        };

        $.fn.ticker.Constructor = Ticker;


        /* TICKER DATA-API
        * =============== */

        $('.ticker-container').each(function () {
            var $ticker = $('<div class="row ticker">');
            $(this).prepend($ticker);

            $ticker.ticker();
        });
    });
}));