import { isObjectIdOrHexString } from "mongoose";
import { connectDB } from "../db";
import Book from "../models/book";
import Genre from "../models/genre";

export interface GenreDetails {
  _id: string;
  name: string;
  books: Array<{
    _id: string;
    title: string;
    isbn: string;
    summary: string;
    url: string;
  }>;
}

export async function loadGenreDetails(
  genreId: string,
): Promise<GenreDetails | null> {
  try {
    if (!isObjectIdOrHexString(genreId)) {
      return null;
    }

    await connectDB();

    const [genre, books] = await Promise.all([
      Genre.findById(genreId).exec(),
      Book.find().where("genre").equals(genreId).exec(),
    ]);

    if (!genre) {
      return null;
    }

    return {
      _id: genre._id.toString(),
      name: genre.name,
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
    console.error("loadGenreDetails error:", errorMessage, error);
    throw new Error(`Failed to load genre details: ${errorMessage}`);
  }
}
