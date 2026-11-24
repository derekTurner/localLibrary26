import { isObjectIdOrHexString } from "mongoose";
import { connectDB } from "../db";
import Author from "../models/author";
import Book from "../models/book";
import Genre from "../models/genre";

export class CreateBookFormError extends Error {}

function getRequiredText(formData: FormData, field: string): string {
  const value = formData.get(field);
  if (typeof value !== "string" || !value.trim()) {
    throw new CreateBookFormError(`${field} is required.`);
  }
  return value.trim();
}

function getSelectedIds(formData: FormData, field: string): string[] {
  const values = formData.getAll(field);
  if (values.length === 0) {
    throw new CreateBookFormError(`Select at least one ${field}.`);
  }

  const ids = values.map((value) => {
    if (typeof value !== "string" || !value.trim()) {
      throw new CreateBookFormError(`Select valid ${field}.`);
    }
    return value.trim();
  });
  if (!ids.every(isObjectIdOrHexString)) {
    throw new CreateBookFormError(`Select valid ${field}.`);
  }
  return ids;
}

export async function createBook(formData: FormData): Promise<string> {
  const title = getRequiredText(formData, "title");
  const summary = getRequiredText(formData, "summary");
  const isbn = getRequiredText(formData, "isbn");
  const authorIds = getSelectedIds(formData, "author");
  const genreIds = getSelectedIds(formData, "genre");

  await connectDB();

  const [authors, genres] = await Promise.all([
    Promise.all(authorIds.map((id) => Author.findById(id).select("_id").exec())),
    Promise.all(genreIds.map((id) => Genre.findById(id).select("_id").exec())),
  ]);

  if (authors.some((author) => !author)) {
    throw new CreateBookFormError("One or more selected authors were not found.");
  }
  if (genres.some((genre) => !genre)) {
    throw new CreateBookFormError("One or more selected genres were not found.");
  }

  const book = await Book.create({
    title,
    author: authorIds,
    summary,
    isbn,
    genre: genreIds,
  });

  return book._id.toString();
}
