import { db } from "../src/lib/db";
import * as argon2 from "argon2";

async function main() {
  const adminEmail = "admin@example.com";
  const adminPassword = "admin123";
  const authorEmail = "author@example.com";
  const authorPassword = "author123";

  const adminPasswordHash = await argon2.hash(adminPassword);
  let admin = await db.user.findUnique({ where: { email: adminEmail } });
  if (!admin) {
    admin = await db.user.create({
      data: {
        email: adminEmail,
        passwordHash: adminPasswordHash,
        role: "ADMIN",
      },
    });
    console.log("Created admin user:", adminEmail);
  } else {
    await db.user.update({
      where: { email: adminEmail },
      data: { passwordHash: adminPasswordHash },
    });
    console.log("Updated admin password:", adminEmail);
  }

  const postCount = await db.post.count();
  if (postCount === 0 && admin) {
    await db.post.create({
      data: {
        title: "サンプル記事",
        slug: "sample-post",
        contentMd: "# こんにちは\n\nこれはサンプル記事です。",
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
