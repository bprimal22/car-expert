import axios, {AxiosInstance, AxiosRequestConfig} from "axios";

const SECURE_API_KEY = '3a7fee10091a11f0b38e0242ac120002'


export class VehicleDatabasesClient {
    private axiosInstance: AxiosInstance;
    private baseUrl: string;
    private authKey: string;

    constructor(authKey: string) {
        this.authKey = authKey;
        this.baseUrl = 'https://api.vehicledatabases.com';
        this.axiosInstance = axios.create({
            baseURL: this.baseUrl,
            timeout: 10000,
        });
    }

    public async decodeVin(vin: string): Promise<any> {
        const endpoint = `/vin-decode/${vin}`;

        const config: AxiosRequestConfig = {
            headers: {
                'x-AuthKey': this.authKey,
            },
        };

        try {
            const response = await this.axiosInstance.get(endpoint, config);
            return response.data;
        } catch (error: any) {
            throw new Error(`Error fetching vehicle data: ${error.response?.data?.message || error.message}`);
        }
    }
}

export default new VehicleDatabasesClient(SECURE_API_KEY)
