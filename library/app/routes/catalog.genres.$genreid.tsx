import { type MetaFunction, Link } from "react-router";
import type { Route } from "./+types/catalog.genres.$genreid";
import {
  loadGenreDetails,
  type GenreDetails,
} from "./catalog.genres.genreid.server";

export const meta: MetaFunction = () => [
  {
    title: "Genre Details",
  },
  {
    name: "description",
    content: "Details and books in a library catalog genre",
  },
];

export async function loader({
  params,
}: Route.LoaderArgs): Promise<{ genre: GenreDetails }> {
  const genre = await loadGenreDetails(params.genreid);

  if (!genre) {
    throw new Response("Genre not found", { status: 404 });
  }

  return { genre };
}

export default function GenreDetailsPage({
  loaderData,
}: Route.ComponentProps) {
  const { genre } = loaderData;

  return (
    <div>
      <div className="text-center">
        <h1>{genre.name}</h1>
      </div>

      <div className="card" style={{ maxWidth: "60em", margin: "0 auto" }}>
        <div className="card-body">
          <h2>Books</h2>
          {genre.books.length > 0 ? (
            <ul className="list-group">
              {genre.books.map((book) => (
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
            <p className="text-muted">No books in this genre are recorded.</p>
          )}

          <Link to="/genres" className="btn btn-secondary mt-3">
            Back to genres
          </Link>
        </div>
      </div>
    </div>
  );
}
