# KeepLink

KeepLink is a simple bookmark service with tags and archive build with [Supabase](https://github.com/supabase/supabase/) and [Next.js](https://nextjs.org).
It doesn't have any social sharing featrue and You can [host your own instance](#self-hosting)

## Features Hightlight

1. Automatically tag new bookmark based on existed tags
2. Automatically fetch titles and descriptions with [metascraper](https://metascraper.js.org)
3. Page archive with [SinglePage](https://github.com/gildas-lormeau/SingleFile) and headless chrome
4. Fulltext search for url, title, description,tag and archived content
5. Tagging alias for admin
6. Database and restful API access thanks to Supabase stack

## ScreenShot

![Desktop ScreenShot](.github/images/keeplink-screenshot.png)

## Demo Site

Site: https://app.keeplink.cc  
Account email and password is `demo@keelink.cc`

It is not a admin account, some admin feature like tag alias management are missing.

## Self hosting

KeepLink is build with Supabase stack and Next.js, But It cannot depoly directly on [vercel.com](https://vercel.com/) and [https://supabase.io](https://supabase.io) (at least for now) for two reason.

1. KeepLink use [rum index](https://github.com/postgrespro/rum) and [zhparser](https://github.com/amutu/zhparser) for better search support which is not currently exist in supabase's extensions list.
2. Vercel's API route has [10 seconds runtime limit](https://vercel.com/docs/platform/limits?query=limit#general-limits) for its hobby plain. Archiving page with headless chrome might reach this limit. Maybe it can be solved by [Supabase Workflows](https://supabase.io/blog/2021/04/02/supabase-workflows).

[Detail Self Hosting Guide](https://github.com/fengkx/keeplink/wiki/Self-Hosting)


More infomation is in https://github.com/fengkx/keeplink/wiki
