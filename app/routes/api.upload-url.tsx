import { json, type ActionFunctionArgs } from "@remix-run/node"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { requireUserToken } from "~/utils/session.server"

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]
const MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB

function getR2Client() {
  const accountId = process.env.R2_ACCOUNT_ID
  const accessKeyId = process.env.R2_ACCESS_KEY_ID
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error("R2 credentials are not configured")
  }

  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  })
}

function extFromContentType(contentType: string): string {
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
  }
  return map[contentType] ?? "bin"
}

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 })
  }

  await requireUserToken(request)

  const formData = await request.formData()
  const filename = formData.get("filename") as string | null
  const contentType = formData.get("contentType") as string | null
  const sizeStr = formData.get("size") as string | null

  if (!filename || !contentType) {
    return json({ error: "filename and contentType are required" }, { status: 400 })
  }

  if (!ALLOWED_TYPES.includes(contentType)) {
    return json({ error: "File type not allowed. Use JPEG, PNG, WebP, or GIF." }, { status: 400 })
  }

  if (sizeStr && parseInt(sizeStr) > MAX_SIZE_BYTES) {
    return json({ error: "File exceeds 5 MB limit." }, { status: 400 })
  }

  const bucket = process.env.R2_BUCKET_NAME
  const publicUrl = process.env.R2_PUBLIC_URL

  if (!bucket || !publicUrl) {
    return json({ error: "Storage is not configured" }, { status: 500 })
  }

  const ext = extFromContentType(contentType)
  const key = `characters/${crypto.randomUUID()}.${ext}`

  const client = getR2Client()
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
  })

  const uploadUrl = await getSignedUrl(client, command, { expiresIn: 300 })
  const objectPublicUrl = `${publicUrl.replace(/\/$/, "")}/${key}`

  return json({ uploadUrl, publicUrl: objectPublicUrl })
}
