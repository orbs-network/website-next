# Safari product illustrations

The dPERPS venue and Execution Services Lambda/VM illustrations are rendered
inline in English and Korean. Hero images and the Japanese archive keep their
existing rendering.

WebKit [bug 325131](https://bugs.webkit.org/show_bug.cgi?id=325131) documents
filtered SVGs embedded as images rendering at 1x and then upscaling on Retina
displays. Its reproduction is sharp when rendered inline. The
[upstream fix](https://github.com/WebKit/WebKit/pull/77569) landed on November 2,
2026; that does not establish availability in the operator's Safari version.

`InlineProductGraphic` reads only six fixed, reviewed repository SVGs on the
server. No remote or user-provided markup enters this component. The exact
paths, gradients and built-in shadow filters are retained. Each rendered
instance scopes its IDs and fragment references, including the hidden theme,
so multiple illustrations cannot resolve another graphic's gradients or filters.
Both themes remain responsive and decorative to assistive technology.

The inline SVG allows its own glow to extend beyond its viewport. The previous
CSS drop-shadow on the whole image is removed: it is no longer needed to
replace the clipped glow and can introduce a separate rasterisation step.
There is no animation, CSS filter or transform on the illustration wrapper.

This trades cached external SVG requests for additional server-rendered markup
on these two pages. It adds no browser JavaScript or dependency. Production
file tracing includes the source assets for future dynamic rendering.

The workaround follows WebKit's reproduction. Chromium checks cannot establish
that an affected physical iPhone is fixed; Safari/device confirmation remains
required. The local WebKit executable cannot launch without additional host
libraries, so no Safari test result is claimed.
