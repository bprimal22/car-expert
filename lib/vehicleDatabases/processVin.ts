import vehicleDatabasesClient from "@/lib/vehicleDatabases/vehicleDatabasesClient";
import {VehicleData} from "@/lib/vehicleDatabases/vehicleData";

export default async function processVin(vin: string): Promise<VehicleData> {
    try {
        const res = await vehicleDatabasesClient.decodeVin(vin);
        if (res.status !== 'success') {
            throw new Error('Unknown problem processing VIN. Please try again later.');
        }
        return res.data as VehicleData;
    } catch (error) {
        console.error(error)
        throw error;
    }
}