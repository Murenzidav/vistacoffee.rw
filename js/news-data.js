/*
  Vista Coffee — News & Events collection
  ---------------------------------------
  To add a post, copy one object below, give it a unique "slug" and fill in the fields.
  Newest posts go first. Images live in /images (use the base name without -sm / .webp).

  category must be one of:
    Company News · Industry Insights · Farmer & Community · Product Development ·
    Exhibitions & Events · Sustainability · Market Insights

  Set placeholder: false (or delete the line) once a post contains real content.
  date: leave "" until a real publication date is set, e.g. "2026-11-05".
*/
window.VISTA_NEWS = [
  {
    slug: "sample-company-announcement",
    placeholder: true,
    title: "Sample Post: Company Announcement",
    category: "Company News",
    date: "",
    image: "cherries-wide",
    alt: "Ripe coffee cherries on a branch",
    excerpt: "Placeholder article. Replace this text with your first company announcement from Vista Coffee.",
    body: [
      "This is a placeholder post. Replace it with a real Vista Coffee announcement.",
      "Use this space to share company news, new partnerships, product launches or milestones with customers and partners."
    ]
  },
  {
    slug: "sample-market-insight",
    placeholder: true,
    title: "Sample Post: Market Insight",
    category: "Market Insights",
    date: "",
    image: "port",
    alt: "Containers being loaded onto a ship at a port",
    excerpt: "Placeholder article. Replace this text with market commentary for importers, roasters and distributors.",
    body: [
      "This is a placeholder post. Replace it with a real market insight article.",
      "Market updates help buyers plan their sourcing and understand the Rwandan coffee season."
    ]
  },
  {
    slug: "sample-farmer-community-story",
    placeholder: true,
    title: "Sample Post: Farmer & Community Story",
    category: "Farmer & Community",
    date: "",
    image: "cherries-ripe",
    alt: "Clusters of coffee cherries ripening among green leaves",
    excerpt: "Placeholder article. Replace this text with a story about the farmers and communities behind your coffee.",
    body: [
      "This is a placeholder post. Replace it with a real story from the field.",
      "Stories from farmers, cooperatives and washing stations show customers where their coffee comes from."
    ]
  }
];
