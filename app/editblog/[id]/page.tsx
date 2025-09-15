import EditBlogForm from '@/components/EditBlogForm';
import React from 'react';
import { toast } from 'sonner';



const getBlog = async (id: string) => {
    try {
        const res = await fetch(`http://localhost:3000/api/blog/${id}`, {
            cache: "no-store",
        });

        if (!res.ok) {
            throw new Error("Failed to fetch");
        }
      

        const data = await res.json();
        return data.blog;
        
        } catch (error) {
        toast.error("invalid feild")
        }
};

export default async function Editblog({ params }: { params: Promise<{ id: string }> }) {
    const id = (await params).id;
    const blog = await getBlog(id);

    if (!blog) return <div>Blog not found.</div>;

    return (
        <div>
            <EditBlogForm blogId={id} initialData={blog}
            />
        </div>
    );
}
