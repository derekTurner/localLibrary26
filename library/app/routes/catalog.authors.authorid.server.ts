import { isObjectIdOrHexString } from "mongoose";
import { connectDB } from "../db";
import Author from "../models/author";
import Book from "../models/book";

export interface AuthorDetails {
  _id: string;
  name: string;
  date_of_birth_formatted: string;
  date_of_death_formatted: string;
  lifespan: string;
  books: Array<{
    _id: string;
    title: string;
    isbn: string;
    summary: string;
    url: string;
  }>;
}

export async function loadAuthorDetails(
  authorId: string,
): Promise<AuthorDetails | null> {
  try {
    if (!isObjectIdOrHexString(authorId)) {
      return null;
    }

    await connectDB();

    const [author, books] = await Promise.all([
      Author.findById(authorId).exec(),
      Book.find().where("author").equals(authorId).exec(),
    ]);

    if (!author) {
      return null;
    }

    const authorObject = author.toObject({ getters: true, virtuals: true });

    return {
      _id: authorObject._id.toString(),
      name:
        authorObject.name ||
        `${authorObject.family_name}, ${authorObject.first_name}`,
      date_of_birth_formatted: authorObject.date_of_birth_formatted || "",
      date_of_death_formatted: authorObject.date_of_death_formatted || "",
      lifespan: String(authorObject.lifespan || "unknown"),
      books: books.map((book) => ({
        _id: book._id.toString(),
        title: book.title,
        isbn: book.isbn,
        summary: book.summary,
        url: book.url || `/catalog/books/${book._id}`,
      })),
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("loadAuthorDetails error:", errorMessage, error);
    throw new Error(`Failed to load author details: ${errorMessage}`);
  }
}
