import { NextResponse } from 'next/server';
import clientPromise from '../../../../lib/mongodb';
import { DATABASE_NAME } from '../../../../config';
import { verifySystemAdmin } from '../../../../helpers';
import { ObjectId } from 'mongodb';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

function toSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .trim();
}

/* ============================================================
 * Helper: Extract Name From Email
 * ============================================================ */
function getAuthorNameFromEmail(email: string | null): string | null {
  if (!email) return null;

  const namePart = email.split('@')[0].trim();

  return namePart
    .replace(/[0-9]/g, '')
    .split(/[._-]/)
    .filter(Boolean)
    .map(
      (part) =>
        part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
    )
    .join(' ');
}

/* ============================================================
 * GET /api/superadmin/blogs/:id
 * ============================================================ */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const systemAdminCheck = await verifySystemAdmin(request);
  if (systemAdminCheck.error) {
    return NextResponse.json(
      { error: systemAdminCheck.error },
      { status: systemAdminCheck.status }
    );
  }

  try {
    const { id } = params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid blog ID' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(DATABASE_NAME);
    const blogsCollection = db.collection('blogs');

    const blog = await blogsCollection.findOne({
      _id: new ObjectId(id),
      deletedAt: null,
    });

    if (!blog) {
      return NextResponse.json({ message: 'Blog not found' }, { status: 404 });
    }

    // Ensure thumbnail is absolute URL
    let thumbnail = blog.thumbnail;
    if (thumbnail && !thumbnail.startsWith('http')) {
      thumbnail = `${BASE_URL}${thumbnail}`;
    }

    return NextResponse.json(
      {
        success: true,
        blog: {
          ...blog,
          thumbnail,
          _id: blog._id.toString(),
        },
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { message: 'Failed to fetch blog' },
      { status: 500 }
    );
  }
}

/* ============================================================
 * PUT /api/superadmin/blogs/:id
 * ============================================================ */
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const systemAdminCheck: any = await verifySystemAdmin(request);
  if (systemAdminCheck.error) {
    return NextResponse.json(
      { error: systemAdminCheck.error },
      { status: systemAdminCheck.status }
    );
  }

  try {
    const { id } = params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid blog ID' }, { status: 400 });
    }

    const formData = await request.formData();

    const title = formData.get('title') as string | null;
    const description = formData.get('description') as string | null;
    const content = formData.get('content') as string | null;
    const categories = formData.getAll('categories');
    const tags = formData.getAll('tags');
    const thumbnail = formData.get('thumbnail') as string | null;

    const decoded = systemAdminCheck.decoded;

    const authorId = decoded?._id ?? decoded?.id ?? null;
    const authorEmail = decoded?.email ?? null;
    const authorName = getAuthorNameFromEmail(authorEmail);

    const client = await clientPromise;
    const db = client.db(DATABASE_NAME);
    const blogsCollection = db.collection('blogs');

    const existingBlog = await blogsCollection.findOne({
      _id: new ObjectId(id),
      deletedAt: null,
    });

    if (!existingBlog) {
      return NextResponse.json({ message: 'Blog not found' }, { status: 404 });
    }

    const updateData: any = {
      updatedAt: new Date(),
      authorId,
      authorEmail,
      authorName,
    };

    if (title !== null) {
      const slug = toSlug(title);

      const duplicate = await blogsCollection.findOne({
        _id: { $ne: new ObjectId(id) },
        slug,
        deletedAt: null,
      });

      if (duplicate) {
        return NextResponse.json(
          { message: 'A blog with this title already exists' },
          { status: 409 }
        );
      }

      updateData.title = title;
      updateData.slug = slug;
    }

    if (description !== null) {
      updateData.description = description.trim();
    }

    if (content !== null) {
      const htmlContent =
        content.trim().startsWith('<')
          ? content
          : `<p>${content.trim()}</p>`;

      updateData.content = htmlContent;
    }

    if (categories.length > 0) {
      updateData.categories = categories
        .map((cat) => cat.toString().trim())
        .filter((cat) => cat !== '');
    }

    if (tags.length > 0) {
      updateData.tags = tags.map((tag) => tag.toString().trim());
    }

    if (thumbnail !== null) {
      updateData.thumbnail = thumbnail;
    }

    await blogsCollection.updateOne(
      { _id: new ObjectId(id), deletedAt: null },
      { $set: updateData }
    );

    const updatedBlog = await blogsCollection.findOne({
      _id: new ObjectId(id),
      deletedAt: null,
    });

    let updatedThumbnail = updatedBlog?.thumbnail;
    if (updatedThumbnail && !updatedThumbnail.startsWith('http')) {
      updatedThumbnail = `${BASE_URL}${updatedThumbnail}`;
    }

    return NextResponse.json(
      {
        success: true,
        blog: {
          ...updatedBlog,
          thumbnail: updatedThumbnail,
          _id: updatedBlog!._id.toString(),
        },
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { message: 'Failed to update blog' },
      { status: 500 }
    );
  }
}

/* ============================================================
 * DELETE /api/superadmin/blogs/:id
 * ============================================================ */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const systemAdminCheck = await verifySystemAdmin(request);
  if (systemAdminCheck.error) {
    return NextResponse.json(
      { error: systemAdminCheck.error },
      { status: systemAdminCheck.status }
    );
  }

  try {
    const { id } = params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid blog ID' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(DATABASE_NAME);
    const blogsCollection = db.collection('blogs');

    const result = await blogsCollection.updateOne(
      { _id: new ObjectId(id), deletedAt: null },
      {
        $set: {
          deletedAt: new Date(),
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: 'Blog not found' }, { status: 404 });
    }

    return NextResponse.json(
      { success: true, message: 'Blog deleted successfully' },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { message: 'Failed to delete blog' },
      { status: 500 }
    );
  }
}