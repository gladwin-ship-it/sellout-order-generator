/* SELLOUT Order Document Generator
   Ports the Oracle Reports RTF layout: one page per (Date, Customer),
   items aggregated by product code. Output is an RTF .doc file. */

(function (root) {
  'use strict';

  // Times New Roman advance widths (1/1000 em) for Oracle-style truncation
  var W = {' ':250,'!':333,'(':333,')':333,'+':564,'-':333,'.':250,'&':778,'/':278,"'":333,',':250,
    '0':500,'1':500,'2':500,'3':500,'4':500,'5':500,'6':500,'7':500,'8':500,'9':500,
    'A':722,'B':667,'C':667,'D':722,'E':611,'F':556,'G':722,'H':722,'I':333,'J':389,'K':722,'L':611,
    'M':889,'N':722,'O':722,'P':556,'Q':722,'R':667,'S':556,'T':611,'U':722,'V':722,'W':944,'X':722,'Y':722,'Z':611};

  var ITEM_LIMIT = 27250, CUST_LIMIT = 20650;

  function truncate(s, limit) {
    var out = '', tot = 0;
    for (var i = 0; i < s.length; i++) {
      tot += (W[s[i]] !== undefined ? W[s[i]] : 600);
      if (tot > limit) break;
      out += s[i];
    }
    return out.replace(/\s+$/, '');
  }

  function esc(s) {
    s = String(s).replace(/\\/g, '\\\\').replace(/\{/g, '\\{').replace(/\}/g, '\\}');
    var out = '';
    for (var i = 0; i < s.length; i++) {
      var c = s.charCodeAt(i);
      if (c < 128) out += s[i];
      else if (c < 256) out += "\\'" + c.toString(16).padStart(2, '0');
      else out += '?';
    }
    return out;
  }

  var MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  function fdate(d) {
    return d.getUTCDate() + '-' + MONTHS[d.getUTCMonth()] + '-' + String(d.getUTCFullYear()).slice(-2);
  }

  var SL_Y  = [3857,4098,4340,4581,4822,5064,5305,5546,5788,6029,6270,6512,6753,6994,7236,7477,7718,7960,8201,8442,8684,8925,9166,9408,9649,9890,10132,10373,10614,10856,11097,11338,11580,11821,12062,12304,12545,12786],
      ROW_Y = [3856,4098,4339,4581,4822,5063,5305,5546,5787,6029,6270,6511,6753,6994,7235,7477,7718,7959,8201,8442,8683,8925,9166,9407,9649,9890,10131,10373,10614,10855,11097,11338,11579,11821,12062,12303,12545,12786];

  function para(x, y, w, h, text, bold, align) {
    return '{\\pard \\' + (align || 'ql') + ' \\pvpg\\phpg\\posx' + x + '\\posy' + y +
      '\\absw' + w + ' \\absh' + h + ' {\\f1\\fs18 \\cf1 ' + (bold ? '\\b ' : '') + text + '\\par}}\n';
  }

  var RECT = '{\\do\\dobxpage\\dobypage\\dprect\n\\dpx269\\dpy1035\\dpxsize11850\\dpysize14655\n' +
             '\\dplinew0 \\dplinesolid\\dplinecor0\\dplinecog0\\dplinecob0\n}\n';

  function pageBody(custCode, custName, orderDate, items, hdr) {
    var p = RECT + RECT;
    p += para(345,1275,1770,-240,'Customer Code       :',true);
    p += para(345,1619,1770,-240,'Customer Name      :',true);
    p += para(345,1934,1770,-240,'Address                     :',true);
    p += para(345,2592,1770,-240,'Phone                        :',true);
    p += para(345,3270,1770,-240,'Reference and No    :',true);
    p += para(6133,1275,1951,-240,'Transaction Code          :',true);
    p += para(6133,1590,1951,-240,'Document No.                :',true);
    p += para(6133,1904,1951,-240,'Order Date                     :',true);
    p += para(6133,2204,1951,-240,'Order Currency             :',true);
    p += para(6133,3270,1951,-240,'Terms of Payment          :',true);
    p += para(8181,1275,698,-240,esc(hdr.txnCode));
    p += para(8181,2206,698,-240,esc(hdr.currency));
    p += para(8181,3285,698,-240,esc(hdr.terms));
    p += para(2251,1933,1056,-240,esc(hdr.city));
    p += para(2251,2218,1056,-240,esc(hdr.country));
    p += para(2251,3285,1056,-240,esc(hdr.reference));
    p += para(2251,1636,3718,-239,esc(truncate(custName, CUST_LIMIT)));
    p += para(2251,1338,3718,-239,esc(custCode));
    p += para(8181,1918,3718,-239,fdate(orderDate));
    p += para(6148,2458,1951,-240,'Order Date                     :',true);
    p += para(8181,2471,3718,-239,fdate(orderDate));
    p += '{\\do\\dobxpage\\dobypage\\dprect\n\\dpx269\\dpy3528\\dpxsize11850\\dpysize330\n' +
         '\\dplinew0 \\dplinesolid\\dplinecor0\\dplinecog0\\dplinecob0\n}\n';
    p += para(449,3618,660,-240,'Sl..No',true);
    p += para(1803,3618,1770,-240,'Item Code',true);
    p += para(5769,3618,960,-240,'Item Name',true);
    p += para(9149,3618,585,-240,'UOM',true);
    p += para(10620,3618,375,-240,'Qty',true);
    var i;
    for (i = 0; i < items.length; i++) p += para(509,  SL_Y[i], 720,-239, String(i+1));
    for (i = 0; i < items.length; i++) p += para(1289, ROW_Y[i],2804,-239, esc(items[i].code));
    for (i = 0; i < items.length; i++) p += para(4094, ROW_Y[i],4815,-239, esc(truncate(items[i].name, ITEM_LIMIT)));
    for (i = 0; i < items.length; i++) p += para(10172,ROW_Y[i],1185,-239, String(items[i].qty), false, 'qr');
    for (i = 0; i < items.length; i++) p += para(9253, ROW_Y[i], 698,-240, 'PCS');
    p += '{\\do\\dobxpage\\dobypage\\dprect\n\\dpx269\\dpy13245\\dpxsize11850\\dpysize2445\n' +
         '\\dplinew0 \\dplinesolid\\dplinecor0\\dplinecog0\\dplinecob0\n}\n';
    p += para(1244,15042,1380,-240,'PREPARED BY',true);
    p += para(9522,15072,1667,-240,'APPROVED BY',true);
    p += '{\\do \\dobxpage\\dobypage \\dpline \\dplinew0 \\dpptx0 \\dppty0 \\dpptx2745 \\dppty0 \\dpx539 \\dpy14817 \\dpxsize2745 \\dpysize0\n}\n' +
         '{\\do \\dobxpage\\dobypage \\dpline \\dplinew0 \\dpptx0 \\dppty0 \\dpptx2745 \\dppty0 \\dpx8966 \\dpy14817 \\dpxsize2745 \\dpysize0\n}\n';
    p += para(599,13813,1725,-240,'Remarks                :',true);
    p += para(600,13425,1725,-240,'Annotation            :',true);
    p += para(2782,13426,1725,-240,esc(hdr.remarks));
    return p;
  }

  var REQUIRED = ['DATE','CUST CODE','Dealer Name','PRODUCT CODE','MODEL','QTY'];

  var DEFAULT_HEADER = {
    txnCode: 'INV', currency: 'KSH', terms: 'CR30D',
    city: 'NAIROBI', country: 'KENYA', reference: 'VISHAL', remarks: 'AS PER VISHAL'
  };

  function excelSerialToDate(n) {
    return new Date(Math.round((n - 25569) * 86400000));
  }
  function normDate(v) {
    if (v instanceof Date) return new Date(Date.UTC(v.getFullYear(), v.getMonth(), v.getDate()));
    if (typeof v === 'number') { var d = excelSerialToDate(v); return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())); }
    var d2 = new Date(v);
    if (!isNaN(d2)) return new Date(Date.UTC(d2.getFullYear(), d2.getMonth(), d2.getDate()));
    return null;
  }

  // rows: array of objects keyed by column headers
  function buildGroups(rows) {
    var map = {};
    rows.forEach(function (r) {
      var dt = normDate(r['DATE']);
      var cc = String(r['CUST CODE'] == null ? '' : r['CUST CODE']).trim();
      if (!dt || !cc) return;
      var key = dt.getTime() + '|' + cc;
      if (!map[key]) map[key] = { date: dt, cust: cc, name: String(r['Dealer Name'] || '').trim(), items: {} };
      var pc = String(r['PRODUCT CODE'] || '').trim();
      if (!pc) return;
      if (!map[key].items[pc]) map[key].items[pc] = { code: pc, name: String(r['MODEL'] || ''), qty: 0 };
      map[key].items[pc].qty += Number(r['QTY']) || 0;
    });
    var groups = Object.keys(map).map(function (k) {
      var g = map[k];
      var items = Object.keys(g.items).sort().map(function (pc) {
        var it = g.items[pc]; it.qty = Math.round(it.qty); return it;
      });
      return { date: g.date, cust: g.cust, name: g.name, items: items };
    });
    groups.sort(function (a, b) {
      if (a.date - b.date) return a.date - b.date;
      return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
    });
    return groups;
  }

  function generateDoc(rows, title, header) {
    var hdr = Object.assign({}, DEFAULT_HEADER, header || {});
    var groups = buildGroups(rows);
    if (!groups.length) throw new Error('No valid data rows (DATE / CUST CODE missing).');
    var now = new Date();
    var doc = '{\\rtf\\ansi\n{\\fonttbl{\\f1 Times New Roman}}\n{\\colortbl;\\red0\\green0\\blue0;}\n' +
      '{\\info {\\creatim \\yr' + now.getFullYear() + ' \\mo\\' + MONTHS[now.getMonth()] +
      ' \\dy' + now.getDate() + ' \\hr12 \\min00 \\sec00} {\\author Oracle Reports} {\\title ' +
      esc(title) + '}  }\n\\viewkind1\n\\paperw16560\\paperh16560\n\\lndscpsxn\n';
    groups.forEach(function (g, idx) {
      var body = pageBody(g.cust, g.name, g.date, g.items, hdr);
      if (idx === 0) {
        doc += '{{\\pard \\phpg\\pvpg\\posx0\\posy0\\absw5000\\absh-1\\nowrap      ' +
               '{This file was created by Oracle Reports. Please view this document in Page Layout mode.}\\par}\n' +
               body + '}\n';
      } else {
        doc += '{\\sect \\sbkpage\n' + body + '}\n';
      }
    });
    doc += '}\n';
    var totalQty = groups.reduce(function (s, g) {
      return s + g.items.reduce(function (t, it) { return t + it.qty; }, 0);
    }, 0);
    return {
      rtf: doc.replace(/\n/g, '\r\n'),
      pages: groups.length,
      totalQty: totalQty,
      customers: groups.reduce(function (set, g) { set[g.cust] = 1; return set; }, {}),
      dateFrom: groups[0].date,
      dateTo: groups[groups.length - 1].date
    };
  }

  var api = {
    REQUIRED: REQUIRED,
    DEFAULT_HEADER: DEFAULT_HEADER,
    buildGroups: buildGroups,
    generateDoc: generateDoc,
    formatDate: fdate,
    normDate: normDate
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.SelloutGen = api;
})(typeof window !== 'undefined' ? window : this);
