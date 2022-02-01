// import { Parser } from '../src/parser';

// describe('Parser', () => {
//   describe('parser()', () => {
//     it('parses title', async () => {
//       const parser = new Parser();

//       const xml = `
//       <?xml version="1.0" encoding="UTF-8" ?>
//       <item>
//       <title>Górnośląskie Koleje Wąskotorowe</title>
//       <link>https://80dni.pl/gornoslaskie-koleje-waskotorowe/</link>
//       <pubDate>Fri, 18 Jun 2021 11:08:15 +0000</pubDate>
//       <dc:creator><![CDATA[avantar]]></dc:creator>
//       <guid isPermaLink="false">https://80dni.pl/?p=4577</guid>
//       <description></description>
//       <wp:post_id>68</wp:post_id>
//       <content:encoded><![CDATA[Simple content]]></content:encoded>
//       </item>`;

//       const parsedXml = await parser.parsePost(xml);

//       expect(parsedXml).toStrictEqual({
//         title: 'Górnośląskie Koleje Wąskotorowe',
//         postId: 68,
//         content: 'Simple content',
//       });
//     });
//   });
// });
