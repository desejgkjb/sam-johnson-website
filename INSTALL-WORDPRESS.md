# Sam Johnson WordPress Theme — Install Guide

The theme zip is `samjohnson-theme.zip` in this folder. It gives you a full backend: edit any text in the page editor, swap any image through the Media Library.

## 1. Get WordPress hosting

Any WordPress host works. The design brief recommends **Pressable** or **WP Engine** (~NZ$15–40/month). The host installs WordPress for you — you'll get a login at `yoursite.com/wp-admin`.

Point the `samjohnson.co.nz` domain at the host once you're ready to go live.

## 2. Install the theme

1. In WP admin: **Appearance → Themes → Add New Theme → Upload Theme**
2. Choose `samjohnson-theme.zip` → **Install Now** → **Activate**

Requires WordPress 6.4+.

## 3. Create the five pages

For each page: **Pages → Add New**, type the title, then in the editor click the **+** inserter → **Patterns** tab → **Sam Johnson** category → insert the matching pattern → **Publish**.

| Page title | Pattern to insert |
|---|---|
| Home | Homepage — full 12-section layout |
| About | About page |
| Experience | Experience page |
| Projects | Projects page |
| Contact | Contact page |

Then set the homepage: **Settings → Reading → Your homepage displays → A static page → Homepage: Home**.

## 4. Set up the navigation menu

1. **Appearance → Editor → Navigation** (or edit the Header template part)
2. Add links in this order: **Home · About · Experience · Projects · Contact**
3. The "Book Sam to Speak" button is already in the header and points to `/contact/`

## 5. Add the contact form

1. Install a form plugin: **Plugins → Add New** → search **WPForms Lite** (or Contact Form 7) → Install → Activate
2. Create a form with fields: Name · Email · Organisation · Enquiry type (dropdown: Speaking engagement / Media request / Partnership / Other) · Message. Set the submit button label to **"Send Enquiry"**.
3. Edit the **Contact** page, replace the italic placeholder paragraph with the WPForms block, and select your form.
4. In the form settings, set notifications to Sam's email address. The theme styles the form fields automatically.

Repeat similarly on the Home page newsletter section if you want email capture (WPForms, Mailchimp block, or your email provider's embed).

## 6. Replace placeholder images

Every image placeholder is a normal WordPress image:

1. Click the image in the page editor
2. Click **Replace → Upload** and choose the real photo
3. Add descriptive alt text (brief requirement: WCAG 2.1 AA)

Photo guidance from the brief: warm colour grading, no cold/blue filters, no stock photography — Sam, his team, or real events only. Upload large versions; WordPress generates the responsive sizes.

## 7. Editing content day-to-day

- **Text**: Pages → edit the page → click any text and type. Update.
- **Images**: click the image → Replace.
- **Colours/fonts**: locked into the theme per the brand guidelines (Vermillion #E84132, Blush #F4E0DC, Charcoal #2D2D2D, Inter). They're available in the editor colour picker if needed — avoid introducing new colours.

## 8. Pre-launch checklist (from the brief)

- [ ] All placeholder text replaced and approved by Sam (testimonials, press names)
- [ ] Real photography uploaded with alt text
- [ ] Contact form tested — submission arrives by email
- [ ] SSL/HTTPS active (host setting)
- [ ] SEO plugin (e.g. Yoast or Rank Math): titles, meta descriptions, OG image, Person schema on Home + About
- [ ] Google Analytics 4 connected (e.g. Site Kit plugin); track form submissions and CTA clicks
- [ ] Test on a phone at 390px width
- [ ] PageSpeed ≥ 90 mobile — enable host caching, keep images compressed (WebP)
