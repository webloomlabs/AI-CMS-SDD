# Data Model: AI-Native CMS MVP

**Date**: October 11, 2025

## Entities

### User
- id: Int (PK, auto)
- email: String (unique)
- password: String (hashed)
- roleId: Int (FK to Role)
- role: Role (relation)
- createdAt: DateTime
- updatedAt: DateTime

**Validation**: Email format, password min 8 chars.

### Role
- id: Int (PK, auto)
- name: String (unique, e.g., admin, editor)

### ContentType
- id: Int (PK, auto)
- name: String (unique)

### ContentItem
- id: Int (PK, auto)
- contentTypeId: Int (FK)
- contentType: ContentType (relation)
- title: String
- slug: String (unique)
- status: String (draft, published)
- createdAt: DateTime
- updatedAt: DateTime
- fields: ContentField[] (relation)
- media: ContentMediaRelation[] (relation)

### ContentField
- id: Int (PK, auto)
- contentTypeId: Int? (FK, for type definition)
- contentType: ContentType? (relation)
- contentItemId: Int? (FK, for instance)
- contentItem: ContentItem? (relation)
- name: String
- type: String (text, rich_text, etc.)
- value: String (JSON string)

### MediaFile
- id: Int (PK, auto)
- filename: String
- path: String
- type: String (mime)
- size: Int
- width: Int?
- height: Int?
- folderId: Int? (FK)
- folder: MediaFolder? (relation)
- transformations: MediaTransformation[] (relation)
- content: ContentMediaRelation[] (relation)
- createdAt: DateTime

### MediaFolder
- id: Int (PK, auto)
- name: String
- parentId: Int? (FK, self)
- parent: MediaFolder? (relation)
- children: MediaFolder[] (relation)
- files: MediaFile[] (relation)

### MediaTransformation
- id: Int (PK, auto)
- mediaId: Int (FK)
- media: MediaFile (relation)
- type: String (resize, crop)
- params: String (JSON)
- path: String

### ContentMediaRelation
- id: Int (PK, auto)
- contentId: Int (FK)
- content: ContentItem (relation)
- mediaId: Int (FK)
- media: MediaFile (relation)
- altText: String?

## Relationships
- User belongs to Role
- ContentItem belongs to ContentType, has many ContentField, many ContentMediaRelation
- ContentField belongs to ContentType or ContentItem
- MediaFile belongs to MediaFolder, has many MediaTransformation, many ContentMediaRelation
- MediaFolder self-referential for hierarchy

## State Transitions
- ContentItem: draft → published
- MediaFile: uploaded → processed (with transformations)