// ==UserScript==
// @name         nJAV
// @namespace    gmspider
// @version      1.0
// @description  nJAV的gmspider
// @author       Luomo
// @match        https://njav.tv/*
// @match        https://javplayer.me/*
// @require      https://cdnjs.cloudflare.com/ajax/libs/jquery/2.2.4/jquery.min.js
// ==/UserScript==
console.log('nJAV user scrpit');
const $ = self.$
$(document).ready(function () {
    const GmSpider = (function () {
        const filter = {
            key: "filter",
            name: "过滤",
            value: [{
                n: "全部",
                v: ""
            }, {
                n: "单个女演员",
                v: "&filter=single_actress"
            }]
        };
        const filterWithoutSort = [
            filter
        ];
        const defaultFilter = [
            filter,
            {
                key: "sort",
                name: "排序方式",
                value: [
                    {
                        n: "最近更新",
                        v: "&sort=recent_update"
                    },
                    {
                        n: "发布时间",
                        v: "&sort=release_date"
                    },
                    {
                        n: "动态",
                        v: "&sort=trending"
                    },
                    {
                        n: "今日最好",
                        v: "&sort=most_viewed_today"
                    },
                    {
                        n: "本周最好",
                        v: "&sort=most_viewed_week"
                    },
                    {
                        n: "本月最好",
                        v: "&sort=most_viewed_month"
                    },
                    {
                        n: "观看次数最多",
                        v: "&sort=most_viewed"
                    },
                    {
                        n: "最喜欢",
                        v: "&sort=most_favourited"
                    }
                ]
            }];

        function pageList(result) {
            result.total = parseInt($("#page-list .section-title .text-muted").text().replace(",", ""));
            result.pagecount = Math.ceil(result.total / result.limit);
            $("#page-list .box-item-list .box-item").each(function (i) {
                result.list.push({
                    vod_id: getIdFromHref($(this).find(".thumb a").attr("href")),
                    vod_name: $(this).find(".detail a").text(),
                    vod_pic: $(this).find(".thumb img").data("src"),
                    vod_year: $(this).find(".duration").text()
                })
            });
            return result;
        }

        function getIdFromHref(href) {
            return href.split("/").at(1);
        }

        function Video(id, data) {
            return data.stream;
        }


        return {
            homeContent: function () {
                const result = {
                    class: [
                        {type_id: "recent-update", type_name: "最近更新"},
                        {type_id: "new-release", type_name: "全新上市"},
                        {type_id: "censored", type_name: "审查"},
                        {type_id: "uncensored", type_name: "未经审查"},
                        {type_id: "uncensored-leaked", type_name: "未经审查泄露"},
                        {type_id: "vr", type_name: "VR"},
                        {type_id: "genres", type_name: "类型"}
                    ],
                    filters: {
                        "recent-update": filterWithoutSort,
                        "new-release": filterWithoutSort,
                        "censored": defaultFilter,
                        "uncensored": defaultFilter,
                        "uncensored-leaked": defaultFilter,
                        "vr": defaultFilter,
                        "genres": defaultFilter
                    },
                    list: [],
                    parse: 0,
                    jx: 0
                };
                $("#top-carousel .box-item-list .box-item:not(.splide__slide--clone)").each(function () {
                    result.list.push({
                        vod_id: getIdFromHref($(this).find("a").attr("href")),
                        vod_name: $(this).find(".name").text(),
                        vod_pic: $(this).find("img").attr("src"),
                    })
                });
                console.log(JSON.stringify(result));
                return result;
            },
            categoryContent: function (tid, pg, filter, extend) {
                console.log(tid, pg, filter, JSON.stringify(extend));
                const result = {
                    list: [],
                    limit: 12,
                    total: 0,
                    page: pg,
                    pagecount: 0
                };
                if (tid === "genres") {
                    $("#page-list .bl-item").each(function () {
                        result.list.push({
                            vod_id: $(this).find("a").attr("href"),
                            vod_name: $(this).find(".name").text(),
                            vod_pic: "https://i.ibb.co/7jb5Gv5/jable-tags-square.png",
                            vod_remarks: $(this).find(".text-muted").text(),
                            vod_tag: "folder",
                            style: {
                                "type": "rect",
                                "ratio": 1
                            }
                        })
                    });
                    result.pagecount = 1;
                } else {
                    pageList(result);
                }
                console.log(JSON.stringify(result));
                return result;
            },
            detailContent: function (ids) {
                // let vodActor = [];
                // $(".video-info .info-header .models .model").each(function () {
                //     const url = new URL($(this).attr("href")).pathname.split('/');
                //     const id = url[1] + "/" + url[2];
                //     const name = $(this).find(".rounded-circle").data("original-title");
                //     vodActor.push(`[a=cr:{"id":"${id}","name":"${name}"}/]${name}[/a]`);
                // });
                let detail = {};
                $("#details .detail-item div").each(function (item) {
                    detail[$(this).find("span:first").text().replace(":", "")] = $(this).find("span:eq(1)").text();
                });
                const vod = {
                    vod_id: ids[0],
                    vod_name: $(".favourite:first").data("code"),
                    vod_pic: $("#player").attr("poster"),
                    vod_remarks: detail["发布日期"],
                    vod_actor: detail["演员"],
                    vod_content: $(".justify-content-between").text(),
                    vod_play_from: "nJAV",
                    vod_play_url: $(".favourite:first").data("code") + "$" + $($("#player").get(0).innerHTML).attr("src"),
                };
                console.log(JSON.stringify({list: [vod]}))
                return {list: [vod]};
            },
            playerContent: function (flag, id, vipFlags) {
                console.log(flag, id, vipFlags);
                const playUrl = eval($("#player").attr("v-scope"));
                const result = {
                    header: JSON.stringify({
                        "User-Agent": window.navigator.userAgent,
                        "Referer": "https://javplayer.me/"
                    }),
                    url: playUrl
                }
                console.log(JSON.stringify(result));
                return result;
            },
            searchContent: function (key, quick, pg) {
                const result = {
                    list: [],
                    limit: 12,
                    total: 0,
                    page: pg,
                    pagecount: 0
                };
                pageList(result);
                console.log(JSON.stringify(result));
                return result;
            }
        };
    })();
    GmSpiderProxy(GmSpider);
});