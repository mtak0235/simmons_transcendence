import { IConnection } from "../../2_domain/connection/IConnection";

class ServerConnection extends IConnection {
    public get(uri: string): Promise<Response> {
        throw new Error("Method not implemented.");
    }
    public post(uri: string, data: { data?: string | undefined; }): Promise<Response> {
        throw new Error("Method not implemented.");
    }
    public delete(uri: string, data: { data?: string | undefined; }): Promise<Response> {
        throw new Error("Method not implemented.");
    }
    public patch(uri: string, data: { data?: string | undefined; }): Promise<Response> {
        throw new Error("Method not implemented.");
    }
}

export default ServerConnection;