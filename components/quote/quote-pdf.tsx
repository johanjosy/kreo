import { Document, Font, Page, StyleSheet, Text, View, pdf } from '@react-pdf/renderer';
import type { QuoteContent } from '@/lib/quote';

// react-pdf needs static (non-variable) font files; these are served from /public/fonts.
let registered = false;
function registerFonts(origin: string) {
  if (registered) return;
  Font.register({
    family: 'Newsreader',
    fonts: [
      { src: `${origin}/fonts/newsreader-400.woff` },
      { src: `${origin}/fonts/newsreader-500.woff`, fontWeight: 500 },
      { src: `${origin}/fonts/newsreader-italic.woff`, fontStyle: 'italic' },
    ],
  });
  Font.register({
    family: 'Hanken',
    fonts: [{ src: `${origin}/fonts/hanken-400.woff` }, { src: `${origin}/fonts/hanken-600.woff`, fontWeight: 600 }],
  });
  Font.registerHyphenationCallback((word) => [word]);
  registered = true;
}

const ink = '#14231D';
const quiet = '#55625C';
const note = '#0E5A43';
const rule = '#D9DFDB';

const s = StyleSheet.create({
  page: { paddingTop: 64, paddingBottom: 72, paddingHorizontal: 64, fontFamily: 'Hanken', fontSize: 10, color: ink, lineHeight: 1.5 },
  brand: { fontFamily: 'Hanken', fontWeight: 600, fontSize: 10, letterSpacing: 1.2, marginBottom: 40 },
  title: { fontFamily: 'Newsreader', fontSize: 28, lineHeight: 1.15, marginBottom: 12 },
  meta: { color: quiet, marginBottom: 2 },
  scope: { fontFamily: 'Newsreader', fontSize: 15, lineHeight: 1.6, marginTop: 28, marginBottom: 24 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 7, borderTopWidth: 0.75, borderTopColor: rule },
  rowItem: { color: quiet },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: 12, marginTop: 4, borderTopWidth: 1.25, borderTopColor: ink },
  total: { fontFamily: 'Newsreader', fontWeight: 500, fontSize: 26 },
  h2: { fontFamily: 'Hanken', fontWeight: 600, fontSize: 10, color: note, marginTop: 32, marginBottom: 8 },
  term: { marginBottom: 4 },
  footer: { position: 'absolute', left: 64, right: 64, bottom: 40, fontSize: 8.5, color: quiet, borderTopWidth: 0.75, borderTopColor: rule, paddingTop: 8 },
});

function QuoteDocument({ q }: { q: QuoteContent }) {
  return (
    <Document title={q.title} author={q.creator} creator="KREO">
      <Page size="A4" style={s.page}>
        <Text style={s.brand}>{q.creator}</Text>
        <Text style={s.title}>{q.title}</Text>
        {q.campaign ? <Text style={s.meta}>Campaign: {q.campaign}</Text> : null}
        <Text style={s.meta}>Prepared by {q.creator} on {q.issued}</Text>
        {q.scope ? <Text style={s.scope}>{q.scope}</Text> : <View style={{ height: 24 }} />}
        {q.rows.map((r, i) => (
          <View key={i} style={s.row} wrap={false}>
            <Text style={s.rowItem}>{r.item}</Text>
            <Text>{r.amount}</Text>
          </View>
        ))}
        <View style={s.totalRow} wrap={false}>
          <Text>Total fee</Text>
          <Text style={s.total}>{q.total}</Text>
        </View>
        <Text style={s.h2}>Terms</Text>
        {q.terms.map((t, i) => (
          <Text key={i} style={s.term}>
            {t}
          </Text>
        ))}
        <Text style={s.footer} fixed>
          {q.footer}
        </Text>
      </Page>
    </Document>
  );
}

export async function quoteBlob(q: QuoteContent): Promise<Blob> {
  registerFonts(window.location.origin);
  return pdf(<QuoteDocument q={q} />).toBlob();
}
