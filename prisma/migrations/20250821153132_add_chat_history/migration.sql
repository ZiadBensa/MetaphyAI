-- AlterTable
ALTER TABLE "ChatMessage" ALTER COLUMN "id" SET DEFAULT concat('msg_', replace(cast(gen_random_uuid() as text), '-', '') );

-- AlterTable
ALTER TABLE "ChatSession" ALTER COLUMN "id" SET DEFAULT concat('chat_', replace(cast(gen_random_uuid() as text), '-', '') );

-- AlterTable
ALTER TABLE "Document" ALTER COLUMN "id" SET DEFAULT concat('doc_', replace(cast(gen_random_uuid() as text), '-', '') );

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "id" SET DEFAULT concat('usr_', replace(cast(gen_random_uuid() as text), '-', '') );
