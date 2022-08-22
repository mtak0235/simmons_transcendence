type Data = {
    data? : string
}

export abstract class IConnection {
    public abstract get(uri:string): Promise<Response>;
    public abstract post(uri:string, data: Data): Promise<Response>;
    public abstract delete(uri:string, data: Data): Promise<Response>;
    public abstract patch(uri:string, data: Data): Promise<Response>;
}