# Form configuration

Both forms use server-side Resend credentials. Configure these variables in
Vercel for each environment that should accept real submissions:

- `RESEND_API_KEY`: a key permitted to send emails and manage contacts.
- `CONTACT_FROM_EMAIL`: a sender on a verified Resend domain.
- `CONTACT_TO_EMAIL`: optional enquiry inbox; defaults to `hello@orbs.com`.
- `RESEND_SEGMENT_ID`: the newsletter segment that receives new subscribers.

The newsletter uses the current Contacts API with `segments: [{ id }]`.
`RESEND_AUDIENCE_ID` is no longer used. See Resend's
[migration guide](https://resend.com/docs/dashboard/contacts/migrating-from-audiences-to-segments).

The contact form forwards enquiries to the team with the submitter as Reply-To.
It sends no autoresponder. Newsletter signup adds a contact directly to the
configured segment, without a confirmation email or newsletter send.

After changing Vercel configuration, deploy again. Before closing #266, submit
an agreed test enquiry and newsletter signup through the deployed forms. Confirm
the enquiry reaches `hello@orbs.com` and the signup appears in the configured
segment. An API success response alone does not establish inbox delivery.
