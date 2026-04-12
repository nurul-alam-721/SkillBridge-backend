-- AlterEnum
ALTER TYPE "BookingStatus" ADD VALUE 'PENDING';

-- -- AlterTable
-- ALTER TABLE "Booking" ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "Review" ALTER COLUMN "comment" DROP NOT NULL;

-- AlterTable
ALTER TABLE "TutorProfile" ALTER COLUMN "bio" DROP NOT NULL;
