import { isObjectIdOrHexString, Types } from "mongoose";
import { connectDB } from "../db";
import BookInstance from "../models/bookinstance";

export interface BookInstanceDetails {
  _id: string;
  book: {
    _id: string;
    title: string;
  };
  imprint: string;
  status: string;
  due_back_formatted: string;
}

export async function loadBookInstanceDetails(
  instanceId: string,
): Promise<BookInstanceDetails | null> {
  try {
    if (!isObjectIdOrHexString(instanceId)) {
      return null;
    }

    await connectDB();

    const instance = await BookInstance.findById(instanceId)
      .populate<{
        book: { _id: Types.ObjectId; title: string } | null;
      }>("book", "title")
      .exec();

    if (!instance?.book) {
      return null;
    }

    return {
      _id: instance._id.toString(),
      book: {
        _id: instance.book._id.toString(),
        title: instance.book.title,
      },
      imprint: instance.imprint,
      status: instance.status,
      due_back_formatted: instance.due_back_formatted || "In Library",
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("loadBookInstanceDetails error:", errorMessage, error);
    throw new Error(`Failed to load book instance details: ${errorMessage}`);
  }
}
