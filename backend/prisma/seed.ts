import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: {
      name: 'admin',
    },
  });

  const editorRole = await prisma.role.upsert({
    where: { name: 'editor' },
    update: {},
    create: {
      name: 'editor',
    },
  });

  console.log('✅ Roles created:', { admin: adminRole.id, editor: editorRole.id });

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: hashedPassword,
      roleId: adminRole.id,
    },
  });

  console.log('✅ Admin user created:', adminUser.email);

  // Create editor user
  const editorPassword = await bcrypt.hash('editor123', 10);
  const editorUser = await prisma.user.upsert({
    where: { email: 'editor@example.com' },
    update: {},
    create: {
      email: 'editor@example.com',
      password: editorPassword,
      roleId: editorRole.id,
    },
  });

  console.log('✅ Editor user created:', editorUser.email);

  // Create a default content type
  const articleType = await prisma.contentType.upsert({
    where: { name: 'Article' },
    update: {},
    create: {
      name: 'Article',
    },
  });

  console.log('✅ Content type created:', articleType.name);

  // Create sample content items
  const article1 = await prisma.contentItem.upsert({
    where: { slug: 'welcome-to-ai-native-cms' },
    update: {},
    create: {
      contentTypeId: articleType.id,
      title: 'Welcome to AI-Native CMS',
      slug: 'welcome-to-ai-native-cms',
      status: 'published',
      fields: {
        create: [
          {
            contentTypeId: articleType.id,
            name: 'body',
            type: 'rich_text',
            value: JSON.stringify({
              type: 'doc',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'Welcome to our AI-Native CMS! This platform combines traditional content management with cutting-edge AI capabilities to help you create, manage, and optimize your content more efficiently.',
                    },
                  ],
                },
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'With features like AI-powered content generation, SEO optimization, and intelligent alt text suggestions, you can accelerate your content workflow while maintaining high quality.',
                    },
                  ],
                },
              ],
            }),
          },
          {
            contentTypeId: articleType.id,
            name: 'excerpt',
            type: 'text',
            value: 'Discover the future of content management with AI-powered features.',
          },
        ],
      },
    },
  });

  const article2 = await prisma.contentItem.upsert({
    where: { slug: 'getting-started-guide' },
    update: {},
    create: {
      contentTypeId: articleType.id,
      title: 'Getting Started Guide',
      slug: 'getting-started-guide',
      status: 'draft',
      fields: {
        create: [
          {
            contentTypeId: articleType.id,
            name: 'body',
            type: 'rich_text',
            value: JSON.stringify({
              type: 'doc',
              content: [
                {
                  type: 'heading',
                  attrs: { level: 2 },
                  content: [
                    {
                      type: 'text',
                      text: 'Getting Started with the CMS',
                    },
                  ],
                },
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'This guide will help you get started with creating and managing content. Learn how to use the content editor, upload media, and leverage AI features.',
                    },
                  ],
                },
                {
                  type: 'heading',
                  attrs: { level: 3 },
                  content: [
                    {
                      type: 'text',
                      text: 'Creating Your First Article',
                    },
                  ],
                },
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: '1. Navigate to the content section\n2. Click "New Article"\n3. Fill in the title and content\n4. Save as draft or publish immediately',
                    },
                  ],
                },
              ],
            }),
          },
          {
            contentTypeId: articleType.id,
            name: 'excerpt',
            type: 'text',
            value: 'Learn how to use the CMS effectively with this comprehensive guide.',
          },
        ],
      },
    },
  });

  const article3 = await prisma.contentItem.upsert({
    where: { slug: 'ai-features-overview' },
    update: {},
    create: {
      contentTypeId: articleType.id,
      title: 'AI Features Overview',
      slug: 'ai-features-overview',
      status: 'published',
      fields: {
        create: [
          {
            contentTypeId: articleType.id,
            name: 'body',
            type: 'rich_text',
            value: JSON.stringify({
              type: 'doc',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'Our AI-powered features are designed to streamline your content creation process:',
                    },
                  ],
                },
                {
                  type: 'bulletList',
                  content: [
                    {
                      type: 'listItem',
                      content: [
                        {
                          type: 'paragraph',
                          content: [
                            {
                              type: 'text',
                              text: 'Content Generation: Create drafts automatically based on your topic',
                            },
                          ],
                        },
                      ],
                    },
                    {
                      type: 'listItem',
                      content: [
                        {
                          type: 'paragraph',
                          content: [
                            {
                              type: 'text',
                              text: 'SEO Optimization: Generate meta descriptions and keywords',
                            },
                          ],
                        },
                      ],
                    },
                    {
                      type: 'listItem',
                      content: [
                        {
                          type: 'paragraph',
                          content: [
                            {
                              type: 'text',
                              text: 'Alt Text Generation: Automatically create descriptive alt text for images',
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            }),
          },
          {
            contentTypeId: articleType.id,
            name: 'excerpt',
            type: 'text',
            value: 'Explore the AI-powered features that make content creation faster and smarter.',
          },
        ],
      },
    },
  });

  console.log('✅ Sample content created:', {
    article1: article1.title,
    article2: article2.title,
    article3: article3.title,
  });

  console.log('🎉 Database seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
