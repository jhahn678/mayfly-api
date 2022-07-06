const User = require('../models/user')
const Group = require('../models/group')
const Place = require('../models/place')
const Message = require('../models/message')
const Catch = require('../models/catch')
const bcrypt = require('bcryptjs')
const { faker } = require('@faker-js/faker')

const seedDatabaseForBackendTesting = async () => {
    await User.deleteMany({})
    await Group.deleteMany({})
    await Place.deleteMany({})
    await Message.deleteMany({})
    await Catch.deleteMany({})

    for(let i = 0; i < 20; i++){
        const fakeFirstName = faker.name.firstName()
        const fakeLastName = faker.name.lastName()
        const user = new User({
            details: {
                firstName: fakeFirstName,
                lastName: fakeLastName,
                fullName: `${fakeFirstName} ${fakeLastName}`,
                username: faker.datatype.uuid(),
            },
            account: {
                email: faker.unique(faker.internet.email)
            }
        })
        await user.save()
    }

    const users = await User.find()

    const newGroup = new Group({
        users: users.map(u => u._id),
        name: 'Test group',
        created_by: users[0]._id
    })

    const group = await newGroup.save()

    for(let user of users){
        const filtered = users.filter(u => u._id !== user._id)

        const newMessage = new Message({
            user: user._id,
            group: group._id,
            type: 'TEXT',
            body: faker.lorem.words(10)
        })

        const message = await newMessage.save()

        const newPlace = new Place({
            name: faker.address.city(),
            description: faker.lorem.words(7),
            user: user._id,
            publish_type: 'PUBLIC',
            location: {
                type: 'Point',
                coordinates: [faker.address.longitude(), faker.address.latitude()]
            }
        })

        const place = await newPlace.save()

        const anotherPlace = new Place({
            name: faker.address.city(),
            description: faker.lorem.words(7),
            publish_type: 'SHARED',
            user: user._id,
            group: group._id,
            location: {
                type: 'Point',
                coordinates: [faker.address.longitude(), faker.address.latitude()]
            }
        })

        const place2 = await anotherPlace.save()

        await Group.findByIdAndUpdate(group._id, {
            $push: { places: place2._id, messages: message._id }
        })

        const places = [ place._id, place2._id ]

        const newCatch = new Catch({
            user: user._id,
            species: faker.animal.fish(),
        })

        const thisNewCatch = await newCatch.save()

        await User.findByIdAndUpdate(user._id, {
            $push: { 
                contacts: { $each: filtered },  
                groups: group._id,
                places: { $each: places },
                catches: thisNewCatch._id
            }
        })
    }
}

const catchImages = [
    'https://storage.googleapis.com/test-images-mayfly/1.jpeg', 'https://storage.googleapis.com/test-images-mayfly/10.jpeg',
    'https://storage.googleapis.com/test-images-mayfly/11.jpeg', 'https://storage.googleapis.com/test-images-mayfly/12.jpeg',
    'https://storage.googleapis.com/test-images-mayfly/13.webp', 'https://storage.googleapis.com/test-images-mayfly/14.jpeg',
    'https://storage.googleapis.com/test-images-mayfly/16.jpeg', 'https://storage.googleapis.com/test-images-mayfly/17.jpeg',
    'https://storage.googleapis.com/test-images-mayfly/18.webp', 'https://storage.googleapis.com/test-images-mayfly/19.jpeg',
    'https://storage.googleapis.com/test-images-mayfly/2.webp', 'https://storage.googleapis.com/test-images-mayfly/20.jpeg',
    'https://storage.googleapis.com/test-images-mayfly/21.jpeg', 'https://storage.googleapis.com/test-images-mayfly/22.webp',
    'https://storage.googleapis.com/test-images-mayfly/23.jpeg', 'https://storage.googleapis.com/test-images-mayfly/24.jpeg',
    'https://storage.googleapis.com/test-images-mayfly/25.jpeg', 'https://storage.googleapis.com/test-images-mayfly/26.jpeg',
    'https://storage.googleapis.com/test-images-mayfly/27.jpeg', 'https://storage.googleapis.com/test-images-mayfly/3.webp',
    'https://storage.googleapis.com/test-images-mayfly/6.jpeg', 'https://storage.googleapis.com/test-images-mayfly/7.jpeg',
    'https://storage.googleapis.com/test-images-mayfly/4.jpeg', 'https://storage.googleapis.com/test-images-mayfly/5.jpeg',
    'https://storage.googleapis.com/test-images-mayfly/9.jpeg', 'https://storage.googleapis.com/test-images-mayfly/8.webp',
]

const species = [
    "brook trout","rainbow trout","green sturgeon","white sturgeon","shortnose sturgeon","lake sturgeon","pallid sturgeon","shovelnose sturgeon",
    "paddlefish","longnose gar","spotted gar","shortnose gar","florida gar","bowfin","ladyfish","tarpon","bonefish","american eel","european eel","silver eel","marbled eel",
    "speckled worm eel","white shad","blueback shad","shad herring","ohio shad","white herring","skipjack shad","skipjack","threadfin shad","pacific thread herring",
    "marquesan sardinella","goldspot herring","silver anchovy","striped anchovy","bay anchovy","northern gulf anchovy","goldeye","mooneye","arctic cisco","bering cisco",
    "broad whitefish","humpback whitefish","least cisco","lake whitefish","deepwater cisco","kiyi","shortnose cisco","shortjaw cisco","powan","atlantic whitefish",
    "pink salmon","chum salmon","silver salmon","masu salmon","sockeye salmon","king salmon","cutthroat trout","gila trout","steelhead","mexican golden trout",
    "atlantic salmon","brown trout","dolly varden","arctic char","lake trout","sea trout","bull trout","inconnu","round whitefish","mountain whitefish","bonneville whitefish",
    "bear lake whitefish","bonneville cisco","arctic grayling","sweetfish","eulachon","northern pike","redfin pickerel","chain pickerel","muskellunge","alaska blackfish",
    "milkfish","banded astyanax","beacon fish","yellow banded moenkhausia","trahira","black banded leporinus","spotted piranha","pirapatinga","european carp","tench",
    "goldfish","crucian carp","fallfish","creek chub","sandhills chub","dixie chub","river chub","bluehead chub","redspot chub","hornyhead chub","redtail chub",
    "bigmouth chub","bull chub","bigeye chub","highback chub","lined chub","rosyface chub","central stoneroller","largescale stoneroller","mexican stoneroller",
    "bluefin stoneroller","peamouth","northern squawfish","sacramento squawfish","colorado squawfish","umpqua squawfish","chiselmouth","lake chub","silver orfe",
    "alvord chub","utah chub","borax lake chub","blue chub","thicktail chub","humpback chub","sonora chub","bonytail chub","chihuahua chub","rio grande chub",
    "yaqui chub","roundtail chub","gila chub","flame chub","california roach","least chub","hitch","orfe","hardhead","sacramento blackfish","woundfin",
    "clear lake splittail","splittail","bitterling","rudd","silver carp","bighead carp","zebra danio","green barb","rosy barb","golden dwarf barb",
    "tiger barb","silver shark","santee chub","slender chub","streamline chub","ozark chub","blotched chub","gravel chub","speckled chub","sturgeon chub",
    "silver chub","oregon chub","flathead chub","longnose sucker","largescale sucker","bridgelip sucker","utah sucker","yaqui sucker","desert sucker",
    "bluehead sucker","owens sucker","sonora sucker","flannelmouth sucker","modoc sucker","sacramento sucker","mountain sucker","rio grande sucker",
    "klamath smallscale sucker","santa ana sucker","klamath largescale sucker","tahoe sucker","warner sucker","quillback carpsucker","river carpsucker",
    "highfin carpsucker","lake chubsucker","creek chubsucker","sharpfin chubsucker","shorthead redhorse","smallmouth redhorse","gray redhorse",
    "blacktail redhorse","silver redhorse","bigeye jumprock","river redhorse","blacktip jumprock","golden redhorse","copper redhorse","greater jumprock",
    "v lip redhorse","smallfin redhorse","striped jumprock","greater redhorse","northern hog sucker","alabama hog sucker","roanoke hog sucker",
    "blue sucker","smallmouth buffalo","bigmouth buffalo","black buffalo","spotted sucker","shortnose sucker","cui ui","june sucker","snake river sucker",
    "razorback sucker","lost river sucker","oriental weatherfish","blue catfish","graceful catfish","yaqui catfish","headwater catfish","tadpole madtom",
    "margined madtom","freckled madtom","ozark madtom","smoky madtom","elegant madtom","mountain madtom","slender madtom","checkered madtom",
    "yellowfin madtom","stonecat","black madtom","carolina madtom","orangefin madtom","least madtom","ouachita madtom","speckled madtom",
    "brindled madtom","frecklebelly madtom","brown madtom","neosho madtom","pygmy madtom","northern madtom","caddo madtom","scioto madtom",
    "flathead catfish","widemouth blindcat","toothless blindcat","snail bullhead","white catfish","black bullhead","yellow bullhead","brown bullhead",
    "flat bullhead","spotted bullhead","walking catfish","whitespotted freshwater catfish","gafftopsail catfish","raphael catfish","granulated catfish",
    "tiger catfish","redtail catfish","hassar","bronze corydoras","swampfish","pirate perch","trout perch","sand roller","saffron cod","frostfish",
    "eelpout","silver gar","silver needlefish","mummichog","northern studfish","stippled studfish","pahrump poolfish","ash meadows poolfish",
    "giant sailfin","porthole livebearer","southern platyfish","variegated platy","swordtail platy","striped mudfish","pez del rey",
    "threespine stickleback","tenspined stickleback","fourspine stickleback","brook stickleback","shorttailed pipefish","bullseye snakehead",
    "snakehead","snakehead mullet","white ricefield eel","coastrange sculpin","slimy sculpin","prickly sculpin","riffle sculpin",
    "rough sculpin","black sculpin","mottled sculpin","paiute sculpin","banded sculpin","shorthead sculpin","utah lake sculpin",
    "bear lake sculpin","potomac sculpin","shoshone sculpin","marbled sculpin","wood river sculpin","margined sculpin","reticulate sculpin",
    "pit sculpin","klamath lake sculpin","torrent sculpin","spoonhead sculpin","slender sculpin","pacific staghorn sculpin","fourhorn sculpin",
    "great sculpin","deepwater sculpin","snook","nile perch","bigeye lates","white perch","striped bass","white bass","yellow bass",
    "black sea bass","rock flagtail","mud sunfish","rock bass","roanoke bass","shadow bass","ozark bass","round sunfish","blackbanded sunfish",
    "bluespotted sunfish","little sunfish","redbreast sunfish","green sunfish","warmouth","bluegill","pumpkinseed","orangespotted sunfish",
    "dollar sunfish","longear sunfish","redear sunfish","spotted sunfish","bantam sunfish","scarlet sunfish","largemouth bass","spotted bass",
    "guadalupe bass","redeye bass","suwannee bass","white crappie","black crappie","everglades pygmy sunfish","okefenokee pygmy sunfish",
    "banded pygmy sunfish","carolina pygmy sunfish","bluebarred pygmy sunfish","sacramento perch","yellow perch","logperch","blotchside logperch",
    "bigscale logperch","roanoke logperch","texas logperch","conasauga logperch","ruffe","roosterfish","silver jenny","graceful mojarra",
    "tidewater mojarra","irish pompano","yellowfin mojarra","silver perch","spot","southern kingfish","black drum","red drum","freshwater drum",
    "oscar","jewelfish","spotted tilapia","zillis tilapia","redbrested bream","blue acara","angelfish","speckled pavon","redstriped eartheater",
    "blue mbuna","rainbow krib","mozambique tilapia","wami tilapia","discus","spotted scat","striped mullet","white mullet","mountain mullet",
    "freckled blenny","fat sleeper","bigmouth sleeper","akupa sleeper","spinycheek sleeper","climbing perch","twospotted climbing perch",
    "fringed flounder","starry flounder","white fluke","hogchoker","blackcheek tonguefish","alabama sturgeon","alligator gar","alaska whitefish",
    "clear chub","umpqua oregon chub","harelip sucker","pealip redhorse","blackfin sucker","rustyside sucker","mexican blindcat",
    "spring pygmy sunfish","smallmouth bass","gulf sturgeon","white sucker","black redhorse","torrent sucker","arroyo chub","red river chub",
    "shoal chub","guadaloupe chub","peppered chub","blackspot barb","trinidad rivulus","north african jewelfish","fiveblotch jewelfish",
    "blue tilapia","longfin tilapia","nile tilapia","blackchin tilapia","tule perch","southern logperch","pygmy whitefish","silver trout",
    "virgin river chub","shoal bass","blackspotted pike","lake herring","bloater","blackfin cisco","gulf grunion","largescaled spinycheek sleeper",
    "shortjaw mudsucker","riffle chub","lerma chub","patzcuaro chub","fleshylip buffalo","southeastern blue sucker","cachama","lacandon sea catfish",
    "cahita sucker","fleshylip sucker","nazas sucker","sonoran sucker","phantom blindcat","catemaco characin","red snakehead","mountain clingfish",
    "peninsular clingfish","mexican clingfish","malheur sculpin","blue ridge sculpin","columbia sculpin","pygmy sculpin","striped mojarra",
    "rainbow characodon","green swordtail",,"bold characodon","parras characodon","mexican rivulus","bicolor molly","dwarf molly",
    "catemaco livebearer","lowland livebearer","blackspotted livebearer","graceful priapella","palenque priapella","olmec priapella",
    "golden skiffia","olive skiffia","splotched skiffia","coatzacoalcos swordtail","monterrey platyfish","cuatro cienegas platyfish",
    "marbled swordtail","catemaco platyfish","zebra mbuna","clown knifefish","blind swamp eel","sauger","zander","walleye",
    "gulf logperch","mobile logperch","brown hoplo","hardhead catfish","ripsaw catfish","pale catfish","olmec blind catfish",
    "blindwhiskered catfish","oaxaca catfish","panuco catfish","balsas catfish","lerma catfish","rio verde catfish","chiapas catfish",
    "west mexican redhorse","remote chub","popoche chub","spottail chub","aztec chub","tinfoil barb","malabar danio","spotfin chub",
    "mexican chub","plateau chub","endorheic chub","shorttail chub","nazas chub","desert chub","mexican roundtail chub","saltillo chub",
    "headwater chub","atoyac chub","papaloapan chub","chapala chub","mexican blind brotula","summer sucker","northern leatherside chub",
    "tui chub","chesapeake logperch","bage del Usumacinta","sardinita yucateca","pepesca lacandona","mojarra del Rio Grande de Chiapa",
    "mojarra caracolera de la Media Luna","mojarra de Leona Vicario","mojarra del Ocotal","White River sculpin","Cultus Lake pygmy sculpin",
    "carpa gorda de Parras","carpa de Iturbide","carpa delgada Parras","southern leatherside chub","carpita Azteca","cachorrito de Villa Lopez",
    "cachorrito besucon","chorumo del Balsas","juil de Catemaco","Chucky madtom","saddled madtom","Squanga whitefish","spring cisco"
]

const randomCatchImage = () => {
    const index = Math.floor(Math.random() * (catchImages.length + 1))
    return catchImages[index]
}

const RigEnum = [
    'Spinning rod', 'Baitcaster', 'Texas rig', 'Swimbait', 'Popper', 'Dry fly', '9ft 5wt fly rod',
    'Wet fly', 'Streamer', 'Live bait', 'Double nymph', 'Panther martin', 'Rooster tail', 'Jig'
]

const randomRig = () => {
    const index = Math.floor(Math.random() * (RigEnum.length + 1))
    return RigEnum[index]
}

const randomSpecies = () => {
    const index = Math.floor(Math.random() * (species.length + 1))
    return species[index]
}

const randomPublishType = () => {
    if(Math.random() > .5){
        return 'PRIVATE'
    }else{
        return 'PUBLIC'
    }
}

const randomPlaceImages = (num) => {
    let images = []
    for(let i = 0; i < num; i++){
        images.push({ url: faker.image.nature() })
    }
    return images;
}


const makeFakeCatches = async (num=3, userId, placeId) => {
    for(let i = 0; i < num; i++){
        const newCatch = new Catch({
            user: userId,
            place: placeId || null,
            location: {
                type: 'Point',
                coordinates: faker.address.nearbyGPSCoordinate([40, -77], 1000)
            },
            publish_type: randomPublishType(),
            title: faker.commerce.productName(),
            species: randomSpecies(),
            length: {
                value: faker.datatype.number({ min: 6, max: 28 }),
                unit: 'IN'
            },
            weight: {
                value: faker.datatype.number({ min: 4, max: 32 }),
                unit: 'OZ'

            },
            rig: randomRig(),
            media: [{ url: randomCatchImage() }]
        })
        const savedCatch  = await newCatch.save()
        await User.findByIdAndUpdate(userId, {
            $push: { catches: savedCatch._id }
        })
    }
}

const makeFakePlaces = async (num=3, userId, groupId) => {
    for(let i = 0; i < num; i++){
        const newPlace = new Place({
            name: faker.commerce.productName(),
            description: faker.commerce.productDescription(),
            avatar: { url: faker.image.avatar() },
            user: userId,
            group: groupId || null,
            publish_type: randomPublishType(),
            location: {
                type: 'Point',
                coordinates: faker.address.nearbyGPSCoordinate([40, -77], 1000)
            },
            media: randomPlaceImages(2)
        })
        const place = await newPlace.save()
        await User.findByIdAndUpdate(userId, {
            $push: { places: place._id }
        })
    }
}

const seedDatabaseForAppTesting = async () => {

    await User.deleteMany({})
    await Group.deleteMany({})
    await Place.deleteMany({})
    await Message.deleteMany({})
    await Catch.deleteMany({})


    let userIds = [];
    for(let i = 0; i < 50; i++){
        const firstName = faker.name.firstName()
        const lastName = faker.name.lastName()
        const newUser = new User({
            details: {
                firstName: firstName,
                lastName: lastName,
                fullName: `${firstName} ${lastName}`,
                username: `${firstName[0]}${lastName}${Math.floor(Math.random()*1000)}`,
                avatar: {
                    url: faker.image.avatar()
                },
                bio: faker.random.words(12),
                location: `${faker.address.cityName()}, ${faker.address.stateAbbr}`
            },
            account: {
                email: faker.unique(faker.internet.email)
            }
        })
        const user = await newUser.save()
        userIds.push(user._id);
    }
    for(let userId of userIds){
        await makeFakePlaces(userId)
        await makeFakeCatches(userId)
    }


    const firstName = faker.name.firstName()
    const lastName = faker.name.lastName()
    const password = await bcrypt.hash('Test', 8)
    const testUser = new User({
        details: {
            firstName: 'Test',
            lastName: 'User',
            fullName: `Test User`,
            username: 'Test User',
            avatar: {
                url: faker.image.avatar()
            },
            bio: faker.random.words(12),
            location: `${faker.address.cityName()}, ${faker.address.stateAbbr()}`
        },
        account: {
            email: 'test@test.com',
            password: password
        },
        contacts: userIds.slice(0, 40),
        pending_contacts: [
            {
                user: userIds[42],
                status: 'TO',
                createdAt: new Date().toISOString()
            },
            {
                user: userIds[43],
                status: 'FROM',
                createdAt: new Date().toISOString()
            }
        ]
    })
    const user = await testUser.save()
    await User.findByIdAndUpdate(userIds[42], { 
        $push: { pending_contacts: { 
            user: user._id,
            status: 'FROM',
            createdAt: new Date().toISOString()
        }}
    })
    await User.findByIdAndUpdate(userIds[43], { 
        $push: { pending_contacts: { 
            user: user._id,
            status: 'TO',
            createdAt: new Date().toISOString()
        }}
    })

    await makeFakePlaces(12, user._id)
    await makeFakeCatches(12, user._id)

    const groupUsers = userIds.slice(0,20)


    const newGroup = new Group({
        created_by: user._id,
        users: [...groupUsers, user._id],
        avatar: { url: faker.image.nature() },
        name: 'The test group',
        media: randomPlaceImages(5)
    })

    const group = await newGroup.save()


    for(let uid of  [...groupUsers, user._id]){
        await User.findByIdAndUpdate(uid, {
            $push: { groups: group._id }
        })
        let messageIds = []
        for(let i = 0; i < 2; i++ ){
            const newMessage = new Message({
                user: uid,
                group: group._id,
                type: 'TEXT',
                body: faker.commerce.productDescription()
            })
            const message = await newMessage.save()
            messageIds.push(message._id)
        }
        const newMessage = new Message({
            user: uid,
            group: group._id,
            type: 'MEDIA',
            body: faker.commerce.productDescription(),
            media: [{ url: faker.image.nature() }]
        })
        const message = await newMessage.save()
        messageIds.push(message._id)
        await Group.findByIdAndUpdate(group._id, {
            $push: { messages: { $each: messageIds } },
            $set: { latest_message: message._id }
        })
    }

}

module.exports = { seedDatabaseForBackendTesting, seedDatabaseForAppTesting }