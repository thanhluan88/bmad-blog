import { db } from "../src/lib/db";
import * as argon2 from "argon2";

async function main() {
  const adminEmail = "admin@example.com";
  const adminPassword = "admin123";
  const authorEmail = "author@example.com";
  const authorPassword = "author123";

  let admin = await db.user.findUnique({ where: { email: adminEmail } });
  if (!admin) {
    const passwordHash = await argon2.hash(adminPassword);
    admin = await db.user.create({
      data: {
        email: adminEmail,
        passwordHash,
        role: "ADMIN",
      },
    });
    console.log("Created admin user:", adminEmail);
  } else {
    console.log("Admin user already exists, skipping.");
  }

  const postCount = await db.post.count();
  if (postCount === 0 && admin) {
    await db.post.create({
      data: {
        title: "Sample post",
        slug: "sample-post",
        contentMd: "# Hello\n\nThis is a sample post.",
        status: "DRAFT",
        authorId: admin.id,
      },
    });
    console.log("Created sample post for admin");
  }

  const existingAuthor = await db.user.findUnique({ where: { email: authorEmail } });
  if (!existingAuthor) {
    const passwordHash = await argon2.hash(authorPassword);
    await db.user.create({
      data: {
        email: authorEmail,
        passwordHash,
        role: "AUTHOR",
      },
    });
    console.log("Created author user:", authorEmail);
  } else {
    console.log("Author user already exists, skipping.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
