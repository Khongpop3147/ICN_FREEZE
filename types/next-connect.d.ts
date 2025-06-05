// types/next-connect.d.ts
import type { NextApiRequest, NextApiResponse } from "next";

declare module "next-connect" {
  type OnError<Req, Res> = (err: any, req: Req, res: Res) => void;
  type OnNoMatch<Req, Res> = (req: Req, res: Res) => void;

  interface NextConnectOptions<Req = NextApiRequest, Res = NextApiResponse> {
    onError?: OnError<Req, Res>;
    onNoMatch?: OnNoMatch<Req, Res>;
  }

  interface NextConnectHandler<Req = NextApiRequest, Res = NextApiResponse> {
    // **ตรงนี้ เพิ่ม call signature**
    (req: Req, res: Res): void | Promise<void>;

    use: (fn: any) => NextConnectHandler<Req, Res>;
    get: (fn: (req: Req, res: Res) => any) => NextConnectHandler<Req, Res>;
    post: (fn: (req: Req, res: Res) => any) => NextConnectHandler<Req, Res>;
    // … เพิ่ม method อื่นๆ ตามต้องการ …
  }

  function nextConnect<Req = NextApiRequest, Res = NextApiResponse>(
    opts?: NextConnectOptions<Req, Res>
  ): NextConnectHandler<Req, Res>;

  export default nextConnect;
}
