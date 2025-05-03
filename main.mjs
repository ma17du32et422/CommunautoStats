import { parseArgs } from 'util';
import fs from 'fs';
import XLSX from "xlsx";

const { values } = parseArgs({
    options: {
        delay: {
            type: "string",
            short: "d",
            default: "15", //minutes
        },
        city: {
            type: "string",
            short: "c",
            default: "montreal",
        },
    }
});
const branchIds = {
    montreal: 1,
}
const branchId = branchIds[values.city];

const earthRadius = 6371;

console.log("Statistiques pour la ville de %s", values.city);


while(true) {
    const cars = await getCars();

    console.log(
        '%i voitures FLEX sur le territoire de %s',
        cars.length,
        values.city
    );

    const carsSorted = cars.sort((a, b) => a.number - b.number);
    const file = fs.writeFileSync('vehicles.json', JSON.stringify(carsSorted, null, 2));


    /*const replacer = (key, value) => value === null ? '' : value
    const header = Object.keys(cars[0])
    const csv = [
        header.join(','), // header row first
        ...cars.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','))
    ].join('\r\n')
    */

    const path = "./data/FLEXs.xlsx";
    const worksheet = XLSX.utils.json_to_sheet(cars);
    const date = new Date();
    const sheetName = (date.toDateString() + " " + date.getHours().toString()+ " " + date.getMinutes().toString());
    console.log(sheetName);


    if(fs.existsSync(path)){
        const workbook = XLSX.readFile(path);
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
        XLSX.writeFile(workbook, path);
        console.log("données inscrites!");
    } else {
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
        XLSX.writeFile(workbook, path);
        console.log("nouveau fichier créé et données inscrites");
    }
    const timeout = parseInt(values.delay)*1000*60;
    await wait(timeout);
    //process.exit();
}



async function getCars() {
    const url = `https://www.reservauto.net/WCF/LSI/LSIBookingServiceV3.svc/GetAvailableVehicles?BranchID=${branchId}&LanguageID=1`;
    //const urlZonesFlex = "https://www.reservauto.net/WCF/Reservauto/Zone/ZonesService.svc/GetLSIZones";
    //const listeStations = "https://restapifrontoffice.reservauto.net/api/v2/Station/?CurrentLanguageID=1&CityId=59&BranchID=1";

    const result = await retry(
        async () => fetch(url)
    );
    const json = await result.json();

    const vehicles = json.d.Vehicles.map(vehicle => {
        const car = {
            brand: vehicle.CarBrand,
            model: vehicle.CarModel,
            plate: vehicle.CarPlate,
            number: vehicle.CarNo,
            color: vehicle.CarColor,
            lat: vehicle.Latitude,
            lng: vehicle.Longitude,
            batteryLevel: vehicle.EnergyLevel,
            lastUseDate: vehicle.LastUseDate,
            lastUseNbHour: vehicle.LastUse,
            promo: vehicle.isPromo,
            seatNb: vehicle.CarSeatNb,
            id: vehicle.CarId,
            vin: vehicle.CarVin,
        };

        //Get plus de valeurs de l'auto: https://www.reservauto.net/WCF/Reservauto/Car/CarService.svc/Select_Car_Vin?&BranchID="1"&Vin="JTDKDTB35E1564198"
        // V2 avec carId encodé : https://www.reservauto.net/WCF/Reservauto/Car/CarService.svc/Select_Car_V2?CarReq={%22CarID%22%3A2522%2C%22LanguageID%22%3A1}
        return car;
    });

    return vehicles;
}

async function retry(callback, times = 3, delay = 1000) {

    try{
        return await callback();
    } catch (error) {

        if (times===0) {
            throw error;
        } else {
            console.warn('Erreur: %s. \nNouvel Essai dans %s secondes', err, delay/1000)
            await wait(delay);
            return retry(cb, times-1, delay);
        }
    }
}
function wait(ms) {

    return new Promise(res => setTimeout(res, ms));

}