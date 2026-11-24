import { type MetaFunction, Link } from "react-router";
import type { Route } from "./+types/catalog.authors.$authorid";
import {
  loadAuthorDetails,
  type AuthorDetails,
} from "./catalog.authors.authorid.server";

export const meta: MetaFunction = () => [
  {
    title: "Author Details",
  },
  {
    name: "description",
    content: "Details and books by an author in the library catalog",
  },
];

export async function loader({
  params,
}: Route.LoaderArgs): Promise<{ author: AuthorDetails }> {
  const author = await loadAuthorDetails(params.authorid);

  if (!author) {
    throw new Response("Author not found", { status: 404 });
  }

  return { author };
}

export default function AuthorDetailsPage({
  loaderData,
}: Route.ComponentProps) {
  const { author } = loaderData;

  return (
    <div>
      <div className="text-center">
        <h1>{author.name}</h1>
      </div>

      <div className="card" style={{ maxWidth: "60em", margin: "0 auto" }}>
        <div className="card-body">
          <dl>
            <dt>Born</dt>
            <dd>{author.date_of_birth_formatted || "Unknown"}</dd>

            <dt>Died</dt>
            <dd>{author.date_of_death_formatted || "Unknown"}</dd>

            <dt>Lifespan</dt>
            <dd>{author.lifespan}</dd>
          </dl>

          <h2>Books</h2>
          {author.books.length > 0 ? (
            <ul className="list-group">
              {author.books.map((book) => (
                <li className="list-group-item" key={book._id}>
                  <h3>
                    <Link to={book.url}>{book.title}</Link>
                  </h3>
                  <div className="text-muted small">ISBN: {book.isbn}</div>
                  <p>{book.summary}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted">No books by this author are recorded.</p>
          )}

          <Link to="/authors" className="btn btn-secondary mt-3">
            Back to authors
          </Link>
        </div>
      </div>
    </div>
  );
}
