import { Form, Link, redirect, useActionData } from "react-router";
import { useState } from "react";
import type { Route } from "./+types/create-book";
import { CreateBookFormError, createBook } from "../forms/createBook";
import { loadAuthors } from "./authors.server";
import { loadGenres } from "./genres.server";

interface DropdownOption {
  _id: string;
  name: string;
}

function MultiSelectDropdown({
  id,
  name,
  label,
  options,
}: {
  id: string;
  name: string;
  label: string;
  options: DropdownOption[];
}) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const selectedLabels = options
    .filter((option) => selectedIds.includes(option._id))
    .map((option) => option.name)
    .join(", ");
  const optionsId = `${id}-options`;

  return (
    <div
      className="mb-3 create-book-field create-book-dropdown"
      onFocus={() => setIsOpen(true)}
      onBlur={(event) => {
        const nextTarget = event.relatedTarget;
        if (
          !(nextTarget instanceof Node) ||
          !event.currentTarget.contains(nextTarget)
        ) {
          setIsOpen(false);
        }
      }}
    >
      <label className="form-label" htmlFor={id}>
        {label}
      </label>
      <div className="create-book-field-control">
        <button
          aria-controls={optionsId}
          aria-expanded={isOpen}
          aria-haspopup="true"
          aria-required="true"
          className="form-select text-start create-book-dropdown-trigger"
          id={id}
          onClick={() => setIsOpen(true)}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setIsOpen(false);
            }
          }}
          type="button"
        >
          {selectedLabels || `Select ${label.toLowerCase()}`}
        </button>
        {isOpen && (
          <div
            aria-labelledby={id}
            className="create-book-dropdown-options"
            id={optionsId}
            role="group"
          >
            {options.length > 0 ? (
              options.map((option) => (
                <label className="create-book-dropdown-option" key={option._id}>
                  <input
                    checked={selectedIds.includes(option._id)}
                    onChange={(event) => {
                      setSelectedIds((currentIds) =>
                        event.target.checked
                          ? [...currentIds, option._id]
                          : currentIds.filter(
                              (currentId) => currentId !== option._id,
                            ),
                      );
                    }}
                    type="checkbox"
                  />
                  {option.name}
                </label>
              ))
            ) : (
              <p className="mb-0">No options available.</p>
            )}
          </div>
        )}
      </div>
      {selectedIds.map((selectedId) => (
        <input key={selectedId} type="hidden" name={name} value={selectedId} />
      ))}
    </div>
  );
}

export async function loader() {
  const [authors, genres] = await Promise.all([loadAuthors(), loadGenres()]);
  return {
    authors: authors.map(({ _id, name }) => ({ _id, name })),
    genres,
  };
}

export async function action({ request }: Route.ActionArgs) {
  try {
    const bookId = await createBook(await request.formData());
    return redirect(`/catalog/books/${bookId}`);
  } catch (error) {
    if (error instanceof CreateBookFormError) {
      return { error: error.message };
    }

    console.error("Create book action error:", error);
    throw new Response("Failed to create book", { status: 500 });
  }
}

export default function CreateBookPage({ loaderData }: Route.ComponentProps) {
  const actionData = useActionData<typeof action>();
  const { authors, genres } = loaderData;

  return (
    <div>
      <div className="text-center">
        <h1>Create Book</h1>
      </div>

      <div className="card" style={{ maxWidth: "60em", margin: "0 auto" }}>
        <div className="card-body">
          {actionData?.error && (
            <div className="alert alert-danger" role="alert">
              {actionData.error}
            </div>
          )}

          <Form method="post">
            <div className="mb-3 create-book-field">
              <label className="form-label" htmlFor="title">
                Title
              </label>
              <input
                className="form-control"
                id="title"
                name="title"
                required
              />
            </div>

            <MultiSelectDropdown
              id="author"
              name="author"
              label="Authors"
              options={authors}
            />

            <div className="mb-3 create-book-field">
              <label className="form-label" htmlFor="isbn">
                ISBN
              </label>
              <input
                className="form-control"
                id="isbn"
                name="isbn"
                required
              />
            </div>

            <MultiSelectDropdown
              id="genre"
              name="genre"
              label="Genres"
              options={genres}
            />

            <div className="mb-3 create-book-field">
              <label className="form-label" htmlFor="summary">
                Summary
              </label>
              <textarea
                className="form-control"
                id="summary"
                name="summary"
                rows={5}
                required
              />
            </div>

            <div className="create-book-form-actions">
              <button type="submit" className="btn btn-primary">
                Create Book
              </button>
              <Link to="/books" className="btn btn-secondary">
                Cancel
              </Link>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}
