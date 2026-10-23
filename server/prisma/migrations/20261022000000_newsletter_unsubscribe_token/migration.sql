-- Jeton de désinscription distinct du jeton de confirmation.
-- Le jeton de confirmation est révoqué à la validation de l'abonnement : le
-- lien de désinscription (qui reposait sur ce même jeton) devenait inopérant.
ALTER TABLE "NewsletterSubscriber"
    ADD COLUMN "unsubscribeToken" TEXT;

-- Remplissage des lignes existantes avant de poser la contrainte d'unicité.
UPDATE "NewsletterSubscriber"
SET "unsubscribeToken" = md5(random()::text || clock_timestamp()::text || id)
WHERE "unsubscribeToken" IS NULL;

ALTER TABLE "NewsletterSubscriber"
    ALTER COLUMN "unsubscribeToken" SET NOT NULL;

CREATE UNIQUE INDEX "NewsletterSubscriber_unsubscribeToken_key"
    ON "NewsletterSubscriber"("unsubscribeToken");
