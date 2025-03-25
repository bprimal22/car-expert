export interface VehicleData {
    intro: {
        vin: string;
    };
    basic: {
        make: string;
        model: string;
        year: string;
        trim: string;
        body_type: string;
        vehicle_type: string;
        vehicle_size: string;
    };
    engine: {
        engine_size: string;
        engine_description: string;
        engine_capacity: string;
    };
    manufacturer: {
        manufacturer: string;
        region: string;
        country: string;
        plant_city: string;
    };
    transmission: {
        transmission_style: string;
    };
    restraint: {
        others: string;
    };
    dimensions: {
        gvwr: string;
    };
    drivetrain: {
        drive_type: string;
    };
    fuel: {
        fuel_type: string;
    };
}