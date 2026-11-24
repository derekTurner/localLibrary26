import type { RouteConfig } from "@react-router/dev/routes";
import {
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  layout("layouts/sidebar.tsx", [
    index("routes/home.tsx"),
    route("catalog", "routes/catalog.tsx"),
    route("catalog/books/:bookid", "routes/catalog.books.$bookid.tsx"),
    route("catalog/authors/:authorid", "routes/catalog.authors.$authorid.tsx"),
    route("catalog/genres/:genreid", "routes/catalog.genres.$genreid.tsx"),
    route("catalog/instances/:instanceid", "routes/catalog.instances.$instanceid.tsx"),
    route("authors", "routes/authors.tsx"),
    route("genres", "routes/genres.tsx"),
    route("books", "routes/books.tsx"),
    route("instances", "routes/bookinstances.tsx"),
  ]),
  route("about", "routes/about.tsx"),
] satisfies RouteConfig;