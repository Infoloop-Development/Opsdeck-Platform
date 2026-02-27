import { NextResponse } from 'next/server';
import clientPromise from '../../../lib/mongodb';
import { DATABASE_NAME } from '../../../config';
import { verifySystemAdmin } from '../../../helpers';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

function toSlug(title: string) {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .trim();
}

/* =========================================
   Helper: Extract Name From Email
========================================= */
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

/* =========================================
   GET /api/superadmin/blogs?page=&limit=
========================================= */
export async function GET(request: Request) {
    const systemAdminCheck = await verifySystemAdmin(request);
    if (systemAdminCheck.error) {
        return NextResponse.json(
            { error: systemAdminCheck.error },
            { status: systemAdminCheck.status }
        );
    }

    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = parseInt(searchParams.get('limit') || '10', 10);
        const search = searchParams.get('search') || '';
        const category = searchParams.get('category') || '';

        const client = await clientPromise;
        const db = client.db(DATABASE_NAME);
        const blogsCollection = db.collection('blogs');

        const query: any = { deletedAt: null };

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { categories: { $regex: search, $options: 'i' } },
                { tags: { $regex: search, $options: 'i' } },
            ];
        }

        if (category) {
            query.categories = { $in: [category] };
        }

        const total = await blogsCollection.countDocuments(query);
        const skip = (page - 1) * limit;

        const blogs = await blogsCollection
            .find(query)
            .project({ content: 0 })
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 })
            .toArray();

        return NextResponse.json(
            {
                success: true,
                blogs: blogs.map((blog) => ({
                    ...blog,
                    _id: blog._id.toString(),
                })),
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('Error fetching blogs:', error);
        return NextResponse.json(
            { message: 'Failed to fetch blogs' },
            { status: 500 }
        );
    }
}

/* =========================================
   POST /api/superadmin/blogs
========================================= */
export async function POST(request: Request) {
    const systemAdminCheck: any = await verifySystemAdmin(request);
    if (systemAdminCheck.error) {
        return NextResponse.json(
            { error: systemAdminCheck.error },
            { status: systemAdminCheck.status }
        );
    }

    try {
        const formData = await request.formData();

        const title = formData.get('title') as string;
        const description = formData.get('description') as string;
        let content = formData.get('content') as string;
        const categories = formData.getAll('categories');
        const tags = formData.getAll('tags');
        const file = formData.get('thumbnail') as File | null;

        if (!title) {
            return NextResponse.json({ message: 'Title is required' }, { status: 400 });
        }

        if (!description) {
            return NextResponse.json({ message: 'Description is required' }, { status: 400 });
        }

        if (!content) {
            return NextResponse.json({ message: 'Content is required' }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db(DATABASE_NAME);
        const blogsCollection = db.collection('blogs');

        const slug = toSlug(title);

        const existing = await blogsCollection.findOne({
            slug,
            deletedAt: null,
        });

        if (existing) {
            return NextResponse.json(
                { message: 'A blog with this title already exists' },
                { status: 409 }
            );
        }

        if (!content.trim().startsWith('<')) {
            content = `<p>${content}</p>`;
        }

        let thumbnailUrl: string | null = null;

        if (file && file.size > 0) {
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            const ext = path.extname(file.name) || '.jpg';
            const uniqueName = `blog-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;

            const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'blogs');
            await mkdir(uploadDir, { recursive: true });

            const filePath = path.join(uploadDir, uniqueName);
            await writeFile(filePath, buffer);

            thumbnailUrl = `${BASE_URL}/uploads/blogs/${uniqueName}`;
        }

        const decoded = systemAdminCheck.decoded;
        const authorId = decoded?._id ?? decoded?.id ?? null;
        const authorEmail = decoded?.email ?? null;
        const authorName = getAuthorNameFromEmail(authorEmail);

        const now = new Date();

        const newBlog = {
            title,
            description,
            content,
            categories: categories.length > 0
                ? categories.map((c) => c.toString().trim())
                : ['General'],
            tags: tags.length > 0
                ? tags.map((t) => t.toString().trim())
                : [],
            thumbnail: thumbnailUrl,
            slug,
            authorId,
            authorEmail,
            authorName,
            createdAt: now,
            updatedAt: now,
            deletedAt: null,
        };

        const result = await blogsCollection.insertOne(newBlog);

        return NextResponse.json(
            {
                success: true,
                blog: {
                    ...newBlog,
                    _id: result.insertedId.toString(),
                },
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.error('Error creating blog:', error);
        return NextResponse.json(
            { message: 'Failed to create blog' },
            { status: 500 }
        );
    }
}

/* =========================================
   PUT /api/superadmin/blogs
   Upload thumbnail only
========================================= */
export async function PUT(request: Request) {
    const systemAdminCheck = await verifySystemAdmin(request);
    if (systemAdminCheck.error) {
        return NextResponse.json(
            { error: systemAdminCheck.error },
            { status: systemAdminCheck.status }
        );
    }

    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { message: 'No file uploaded' },
                { status: 400 }
            );
        }

        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { message: 'Only JPEG, PNG, and WebP images are allowed' },
                { status: 400 }
            );
        }

        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json(
                { message: 'File size must be under 5MB' },
                { status: 400 }
            );
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const ext = path.extname(file.name) || '.jpg';

        const uniqueName = `blog-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'blogs');
        const filePath = path.join(uploadDir, uniqueName);

        await mkdir(uploadDir, { recursive: true });
        await writeFile(filePath, buffer);

        const fileUrl = `${BASE_URL}/uploads/blogs/${uniqueName}`;

        return NextResponse.json(
            { success: true, fileUrl },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('Error uploading thumbnail:', error);
        return NextResponse.json(
            { message: 'Failed to upload thumbnail' },
            { status: 500 }
        );
    }
}