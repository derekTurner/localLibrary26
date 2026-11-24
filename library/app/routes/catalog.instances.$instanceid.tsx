import { type MetaFunction, Link } from "react-router";
import type { Route } from "./+types/catalog.instances.$instanceid";
import {
  loadBookInstanceDetails,
  type BookInstanceDetails,
} from "./catalog.instances.instanceid.server";

export const meta: MetaFunction = () => [
  {
    title: "Book Instance Details",
  },
  {
    name: "description",
    content: "Details for a copy of a book in the library catalog",
  },
];

export async function loader({
  params,
}: Route.LoaderArgs): Promise<{ instance: BookInstanceDetails }> {
  const instance = await loadBookInstanceDetails(params.instanceid);

  if (!instance) {
    throw new Response("Book instance not found", { status: 404 });
  }

  return { instance };
}

export default function BookInstanceDetailsPage({
  loaderData,
}: Route.ComponentProps) {
  const { instance } = loaderData;

  return (
    <div>
      <div className="text-center">
        <h1>Book Instance Details</h1>
      </div>

      <div className="card" style={{ maxWidth: "60em", margin: "0 auto" }}>
        <div className="card-body">
          <dl>
            <dt>Book</dt>
            <dd>
              <Link to={`/catalog/books/${instance.book._id}`}>
                {instance.book.title}
              </Link>
            </dd>

            <dt>Imprint</dt>
            <dd>{instance.imprint}</dd>

            <dt>Status</dt>
            <dd>{instance.status}</dd>

            <dt>Due back</dt>
            <dd>{instance.due_back_formatted}</dd>
          </dl>

          <Link to="/instances" className="btn btn-secondary">
            Back to book instances
          </Link>
        </div>
      </div>
    </div>
  );
}
