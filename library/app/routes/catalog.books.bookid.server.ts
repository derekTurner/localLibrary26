import { isObjectIdOrHexString } from "mongoose";
import { connectDB } from "../db";
import Author from "../models/author";
import Book from "../models/book";
import BookInstance from "../models/bookinstance";
import Genre from "../models/genre";

export interface BookDetails {
  _id: string;
  title: string;
  authors: Array<{
    _id: string;
    first_name: string;
    family_name: string;
    name: string;
  }>;
  summary: string;
  isbn: string;
  genres: Array<{
    _id: string;
    name: string;
  }>;
  instances: Array<{
    _id: string;
    imprint: string;
    status: string;
    due_back_formatted: string;
  }>;
}

export async function loadBookDetails(
  bookId: string,
): Promise<BookDetails | null> {
  try {
    if (!isObjectIdOrHexString(bookId)) {
      return null;
    }

    await connectDB();

    const book = await Book.findById(bookId)
      .populate({ path: "author", model: Author })
      .populate({ path: "genre", model: Genre })
      .exec();

    if (!book) {
      return null;
    }

    const bookObject = book.toObject({ getters: true, virtuals: true });
    const instances = await BookInstance.find({ book: bookId }).exec();

    return {
      _id: bookObject._id.toString(),
      title: bookObject.title,
      authors: (bookObject.author || []).map((author) => ({
        _id: author._id.toString(),
        first_name: author.first_name,
        family_name: author.family_name,
        name: author.name || `${author.family_name}, ${author.first_name}`,
      })),
      summary: bookObject.summary,
      isbn: bookObject.isbn,
      genres: (bookObject.genre || []).map((genre) => ({
        _id: genre._id.toString(),
        name: genre.name,
      })),
      instances: instances.map((instance) => {
        const instanceObject = instance.toObject({
          getters: true,
          virtuals: true,
        });

        return {
          _id: instanceObject._id.toString(),
          imprint: instanceObject.imprint,
          status: instanceObject.status,
          due_back_formatted: instanceObject.due_back_formatted || "In Library",
        };
      }),
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("loadBookDetails error:", errorMessage, error);
    throw new Error(`Failed to load book details: ${errorMessage}`);
  }
}