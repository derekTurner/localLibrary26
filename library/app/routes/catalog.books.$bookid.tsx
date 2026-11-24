import { type MetaFunction } from "react-router";
import type { Route } from "./+types/catalog.books.$bookid";
import {
  loadBookDetails,
  type BookDetails,
} from "./catalog.books.bookid.server";

export const meta: MetaFunction = () => [
  {
    title: "Book Details",
  },
  {
    name: "description",
    content: "Details for a book in the library catalog",
  },
];

export async function loader({
  params,
}: Route.LoaderArgs): Promise<{ book: BookDetails }> {
  const book = await loadBookDetails(params.bookid);

  if (!book) {
    throw new Response("Book not found", { status: 404 });
  }

  return { book };
}

export default function BookDetailsPage({
  loaderData,
}: Route.ComponentProps) {
  const { book } = loaderData;

  return (
    <div>
      <div className="text-center">
        <h1>{book.title}</h1>
      </div>

      <div className="card" style={{ maxWidth: "60em", margin: "0 auto" }}>
        <div className="card-body">
          <dl>
            <dt>Author{book.authors.length === 1 ? "" : "s"}</dt>
            <dd>
              {book.authors.map((author) => author.name).join(", ") ||
                "Unknown"}
            </dd>

            <dt>ISBN</dt>
            <dd>{book.isbn}</dd>

            <dt>Genre{book.genres.length === 1 ? "" : "s"}</dt>
            <dd>
              {book.genres.map((genre) => genre.name).join(", ") ||
                "Unclassified"}
            </dd>

            <dt>Summary</dt>
            <dd>{book.summary}</dd>
          </dl>

          <h2>Copies</h2>
          {book.instances.length > 0 ? (
            <ul className="list-group">
              {book.instances.map((instance) => (
                <li className="list-group-item" key={instance._id}>
                  <div>
                    <strong>{instance.imprint}</strong>
                  </div>
                  <div className="text-muted small">
                    <div>Status: {instance.status}</div>
                    <div>Due back: {instance.due_back_formatted}</div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted">No copies of this book are recorded.</p>
          )}
        </div>
      </div>
    </div>
  );
}