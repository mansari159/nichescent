/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://raretrace.vercel.app',
  generateRobotsTxt: true,
  exclude: ['/api/*'],
  robotsTxtOptions: { policies: [{ userAgent: '*', allow: '/' }] },
}
