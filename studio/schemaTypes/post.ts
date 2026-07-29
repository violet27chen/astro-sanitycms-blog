import {defineField, defineType} from 'sanity'
import {DocumentIcon} from '@sanity/icons'

export default defineType({
  name: 'post',
  title: 'Post',
  type: 'document',
  icon: DocumentIcon,
  groups: [
    {
      name: 'content',
      title: 'Content',
      default: true,
    },
    {
      name: 'seo',
      title: 'SEO',
    },
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
      group: 'content',
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      description: 'Should not contain a leading slash and must contain a trailing slash.',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
      group: 'content',
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published at',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
      group: 'content',
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover image',
      type: 'customImage',
      group: 'content',
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      description: 'Short summary used in listing cards and SEO/social sharing.',
      type: 'text',
      rows: 3,
      group: 'content',
    }),
    defineField({
      name: 'body',
      title: 'Body',
      description: 'Article content. Write in markdown — code blocks, tables and images are supported.',
      type: 'markdown',
      validation: (Rule) => Rule.required(),
      group: 'content',
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: [{type: 'person'}],
      group: 'content',
    }),
    defineField({
      name: 'metaTitle',
      title: 'Title',
      description: 'A page title for SEO and social sharing. Ideally between 15 and 70 characters.',
      type: 'string',
      validation: (Rule) => Rule.max(70).warning('Consider shortening the title'),
      group: 'seo',
    }),
    defineField({
      name: 'addTitleSuffix',
      title: 'Add title suffix',
      description:
        'If enabled, the title suffix defined in the site configuration is appended to the title tag of this page.',
      type: 'boolean',
      initialValue: true,
      group: 'seo',
    }),
    defineField({
      name: 'metaDescription',
      title: 'Description',
      description:
        'A short paragraph for SEO and social sharing. Ideally between 70 and 160 characters.',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.max(160).warning('Consider shortening the description'),
      group: 'seo',
    }),
    defineField({
      name: 'socialImage',
      title: 'Image',
      description: 'Open graph image used in social sharing. Falls back to the cover image.',
      type: 'image',
      group: 'seo',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'publishedAt',
      media: 'coverImage.image.asset',
    },
    prepare({title, subtitle, media}) {
      return {
        title: title,
        subtitle: subtitle ? new Date(subtitle).toLocaleDateString() : '',
        media: media,
      }
    },
  },
})
