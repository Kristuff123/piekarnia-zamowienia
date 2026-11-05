export interface Shop {
  id: string;
  name: string;
  city: string;
  region: string;
}

export const SHOPS: Shop[] = [
  { id: "s1", name: "Sklep Centrum", city: "Warszawa", region: "Mazowieckie" },
  { id: "s2", name: "Sklep Galeria", city: "Kraków", region: "Małopolskie" },
  { id: "s3", name: "Sklep Rynek", city: "Wrocław", region: "Dolnośląskie" },
  { id: "s4", name: "Sklep Park", city: "Gdańsk", region: "Pomorskie" },
];

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  unit: string;
  price: number;
}

export const PRODUCTS: Product[] = [
  { id: "p1", sku: "CHL-001", name: "Chleb pszenny 500g", category: "Pieczywo", unit: "szt", price: 4.5 },
  { id: "p2", sku: "CHL-002", name: "Chleb razowy 700g", category: "Pieczywo", unit: "szt", price: 5.2 },
  { id: "p3", sku: "BUŁ-010", name: "Bułka kajzerka", category: "Pieczywo", unit: "szt", price: 0.9 },
  { id: "p4", sku: "CIA-020", name: "Ciasto szarlotka", category: "Cukiernia", unit: "kg", price: 38.0 },
  { id: "p5", sku: "CIA-021", name: "Sernik wiedeński", category: "Cukiernia", unit: "kg", price: 42.0 },
  { id: "p6", sku: "CIA-022", name: "Pączek z różą", category: "Cukiernia", unit: "szt", price: 3.5 },
  { id: "p7", sku: "TAR-030", name: "Tarta owocowa", category: "Cukiernia", unit: "szt", price: 28.0 },
  { id: "p8", sku: "NAP-040", name: "Kawa ziarnista 1kg", category: "Napoje", unit: "kg", price: 52.0 },
  { id: "bp101", sku: "PIE-100", name: "Chleb pszenny", category: "Pieczywo", unit: "szt", price: 4.5 },
  { id: "bp102", sku: "PIE-101", name: "Chleb okrągły", category: "Pieczywo", unit: "szt", price: 4.5 },
  { id: "bp103", sku: "PIE-102", name: "Chleb z siemieniem lnianym", category: "Pieczywo", unit: "szt", price: 4.5 },
  { id: "bp104", sku: "PIE-103", name: "Chleb Chojnicki", category: "Pieczywo", unit: "szt", price: 4.5 },
  { id: "bp105", sku: "PIE-104", name: "Chleb z makiem", category: "Pieczywo", unit: "szt", price: 4.5 },
  { id: "bp106", sku: "PIE-105", name: "Chleb koszykowy", category: "Pieczywo", unit: "szt", price: 4.5 },
  { id: "bp107", sku: "PIE-106", name: "Chleb chojnicki z ziarnami", category: "Pieczywo", unit: "szt", price: 4.5 },
  { id: "bp108", sku: "PIE-107", name: "Chleb swojski", category: "Pieczywo", unit: "szt", price: 4.5 },
  { id: "bp109", sku: "PIE-108", name: "Chleb razowy z dynią", category: "Pieczywo", unit: "szt", price: 4.5 },
  { id: "bp110", sku: "PIE-109", name: "Chleb z niskim indeksem glikemicznym", category: "Pieczywo", unit: "szt", price: 4.5 },
  { id: "bp111", sku: "PIE-110", name: "Chleb żytni 100% ze słonecznikiem", category: "Pieczywo", unit: "szt", price: 4.5 },
  { id: "bp112", sku: "PIE-111", name: "Chleb 7 Ziaren", category: "Pieczywo", unit: "szt", price: 4.5 },
  { id: "bp113", sku: "PIE-112", name: "Chleb razowy ze słonecznikiem", category: "Pieczywo", unit: "szt", price: 4.5 },
  { id: "bp114", sku: "PIE-113", name: "Chleb graham", category: "Pieczywo", unit: "szt", price: 4.5 },
  { id: "bp115", sku: "PIE-114", name: "Chleb orkiszowy pełnoziarnisty", category: "Pieczywo", unit: "szt", price: 4.5 },
  { id: "bp116", sku: "PIE-115", name: "Chleb żytni 100%", category: "Pieczywo", unit: "szt", price: 4.5 },
  { id: "bp117", sku: "PIE-116", name: "Chleb wieloziarnisty", category: "Pieczywo", unit: "szt", price: 4.5 },
  { id: "bp118", sku: "PIE-117", name: "Chleb o bardzo niskiej zawartości glutenu", category: "Pieczywo", unit: "szt", price: 4.5 },
  { id: "bp119", sku: "PIE-118", name: "Chleb „Pełne ziarno”", category: "Pieczywo", unit: "szt", price: 4.5 },
  { id: "bp120", sku: "PIE-119", name: "Chleb żytnio-orkiszowy", category: "Pieczywo", unit: "szt", price: 4.5 },
  { id: "bp121", sku: "PIE-120", name: "Chleb żytni 100% z żurawiną", category: "Pieczywo", unit: "szt", price: 4.5 },
  { id: "bp122", sku: "PIE-121", name: "Chleb pszenny na żytnim zakwasie", category: "Pieczywo", unit: "szt", price: 4.5 },
  { id: "bp123", sku: "PIE-122", name: "Chleb z pradawnymi zbożami", category: "Pieczywo", unit: "szt", price: 4.5 },
  { id: "bp124", sku: "PIE-123", name: "Chleb razowy tradycyjny", category: "Pieczywo", unit: "szt", price: 4.5 },
  { id: "bp125", sku: "PIE-124", name: "Bułka rustykalna", category: "Pieczywo", unit: "szt", price: 4.5 },
  { id: "bp126", sku: "PIE-125", name: "Bułka musli", category: "Pieczywo", unit: "szt", price: 4.5 },
  { id: "bp127", sku: "PIE-126", name: "Bułka ziarnista z dynią", category: "Pieczywo", unit: "szt", price: 4.5 },
  { id: "bp128", sku: "PIE-127", name: "Bułka ziarnista ze słonecznikiem", category: "Pieczywo", unit: "szt", price: 4.5 },
  { id: "bp129", sku: "PIE-128", name: "Bułka pszenno żytnia", category: "Pieczywo", unit: "szt", price: 4.5 },
  { id: "bp130", sku: "PIE-129", name: "Bułka ze szpinakiem", category: "Pieczywo", unit: "szt", price: 4.5 },
  { id: "bp131", sku: "PIE-130", name: "Bułka wrocławska", category: "Pieczywo", unit: "szt", price: 4.5 },
  { id: "bp132", sku: "PIE-131", name: "Bułka grahamka z sezamem", category: "Pieczywo", unit: "szt", price: 4.5 },
  { id: "bp133", sku: "PIE-132", name: "Bagietka długa", category: "Pieczywo", unit: "szt", price: 4.5 },
  { id: "bp134", sku: "PIE-133", name: "Bagietka rustykalna", category: "Pieczywo", unit: "szt", price: 4.5 },
  { id: "bp135", sku: "PIE-134", name: "Chałka", category: "Pieczywo", unit: "szt", price: 4.5 },
  { id: "bp136", sku: "PIE-135", name: "Bajgle", category: "Pieczywo", unit: "szt", price: 4.5 },
  { id: "bp137", sku: "CUK-136", name: "Kostka cytrynowa", category: "Cukiernia", unit: "szt", price: 12 },
  { id: "bp138", sku: "CUK-137", name: "Kostka dubajska", category: "Cukiernia", unit: "szt", price: 12 },
  { id: "bp139", sku: "CUK-138", name: "Kostka wiśniowa", category: "Cukiernia", unit: "szt", price: 12 },
  { id: "bp140", sku: "CUK-139", name: "Kostka jogurtowo – brzoskwiniowa", category: "Cukiernia", unit: "szt", price: 12 },
  { id: "bp141", sku: "CUK-140", name: "Kostka Delicja", category: "Cukiernia", unit: "szt", price: 12 },
  { id: "bp142", sku: "CUK-141", name: "Kostka bezowo – malinowa", category: "Cukiernia", unit: "szt", price: 12 },
  { id: "bp143", sku: "CUK-142", name: "Kostka kawowo – czekoladowa", category: "Cukiernia", unit: "szt", price: 12 },
  { id: "bp144", sku: "CUK-143", name: "Kostka chałwowa", category: "Cukiernia", unit: "szt", price: 12 },
  { id: "bp145", sku: "CUK-144", name: "Kostka 3 bit", category: "Cukiernia", unit: "szt", price: 12 },
  { id: "bp146", sku: "CUK-145", name: "Kostka Kukułka", category: "Cukiernia", unit: "szt", price: 12 },
  { id: "bp147", sku: "CUK-146", name: "Kostka słoneczna", category: "Cukiernia", unit: "szt", price: 12 },
  { id: "bp148", sku: "CUK-147", name: "Kostka toffi", category: "Cukiernia", unit: "szt", price: 12 },
  { id: "bp149", sku: "CUK-148", name: "Kostka hiszpańska", category: "Cukiernia", unit: "szt", price: 12 },
  { id: "bp150", sku: "CUK-149", name: "Kostka bezowo – adwokatowa", category: "Cukiernia", unit: "szt", price: 12 },
  { id: "bp151", sku: "CUK-150", name: "Kostka Rafael", category: "Cukiernia", unit: "szt", price: 12 },
  { id: "bp152", sku: "CUK-151", name: "Kostka Stracciatella", category: "Cukiernia", unit: "szt", price: 12 },
  { id: "bp153", sku: "CUK-152", name: "Kostka Leśny Mech", category: "Cukiernia", unit: "szt", price: 12 },
  { id: "bp154", sku: "CUK-153", name: "Kostka ananasowa", category: "Cukiernia", unit: "szt", price: 12 },
  { id: "bp155", sku: "CUK-154", name: "Kostka czekoladowo – gruszkowa", category: "Cukiernia", unit: "szt", price: 12 },
  { id: "bp156", sku: "CUK-155", name: "Kostka czekoladowa", category: "Cukiernia", unit: "szt", price: 12 },
  { id: "bp157", sku: "CUK-156", name: "Kostka malinowo – czekoladowa", category: "Cukiernia", unit: "szt", price: 12 },
  { id: "bp158", sku: "CUK-157", name: "Sernik na zimno", category: "Cukiernia", unit: "szt", price: 12 },
  { id: "bp159", sku: "CUK-158", name: "Sernik miodowo – cynamonowy", category: "Cukiernia", unit: "szt", price: 12 },
  { id: "bp160", sku: "CUK-159", name: "Sernik miodowo – pistacjowy", category: "Cukiernia", unit: "szt", price: 12 },
  { id: "bp161", sku: "CUK-160", name: "Sernik miodowy z malinami", category: "Cukiernia", unit: "szt", price: 12 },
  { id: "bp162", sku: "CUK-161", name: "Sernik z brzoskwiniami", category: "Cukiernia", unit: "szt", price: 12 },
  { id: "bp163", sku: "CUK-162", name: "Sernik warszawski", category: "Cukiernia", unit: "szt", price: 12 },
  { id: "bp164", sku: "CUK-163", name: "Sernik z polewą kajmakowo – orzechową", category: "Cukiernia", unit: "szt", price: 12 },
  { id: "bp165", sku: "CUK-164", name: "Sernik z mandarynką", category: "Cukiernia", unit: "szt", price: 12 },
  { id: "bp166", sku: "CUK-165", name: "Sernik z pistacjami", category: "Cukiernia", unit: "szt", price: 12 },
  { id: "bp167", sku: "CUK-166", name: "Sernik z wiśniami", category: "Cukiernia", unit: "szt", price: 12 },
  { id: "bp168", sku: "CUK-167", name: "Sernik amerykański", category: "Cukiernia", unit: "szt", price: 12 },
  { id: "bp169", sku: "CUK-168", name: "Sernik z kremem brulee", category: "Cukiernia", unit: "szt", price: 12 },
  { id: "bp170", sku: "CUK-169", name: "Sernik wiedeński z bakaliami", category: "Cukiernia", unit: "szt", price: 12 },
  { id: "bp171", sku: "CUK-170", name: "Ciasto marchewkowe", category: "Cukiernia", unit: "szt", price: 12 },
  { id: "bp172", sku: "CUK-171", name: "Jabłecznik florentynkowy", category: "Cukiernia", unit: "szt", price: 12 },
  { id: "bp173", sku: "CUK-172", name: "Tarta jabłkowa", category: "Cukiernia", unit: "szt", price: 12 },
  { id: "bp174", sku: "CUK-173", name: "Ciasto sezonowe", category: "Cukiernia", unit: "szt", price: 12 },
  { id: "bp175", sku: "CUK-174", name: "Szarlotka", category: "Cukiernia", unit: "szt", price: 12 },
  { id: "bp176", sku: "CUK-175", name: "Isaura", category: "Cukiernia", unit: "szt", price: 12 },
  { id: "bp177", sku: "CUK-176", name: "Babka cytrynowa", category: "Cukiernia", unit: "szt", price: 12 },
  { id: "bp178", sku: "CUK-177", name: "Babka domowa z kakao", category: "Cukiernia", unit: "szt", price: 12 },
  { id: "bp179", sku: "CUK-178", name: "Babka domowa", category: "Cukiernia", unit: "szt", price: 12 },
  { id: "bp180", sku: "CUK-179", name: "Brownie", category: "Cukiernia", unit: "szt", price: 12 },
  { id: "bp181", sku: "CUK-180", name: "Krajanka z twarogiem", category: "Cukiernia", unit: "szt", price: 12 },
  { id: "bp182", sku: "CUK-181", name: "Koperta z jabłkiem", category: "Cukiernia", unit: "szt", price: 12 },
  { id: "bp183", sku: "CUK-182", name: "Tartaletka z żurawiną", category: "Cukiernia", unit: "szt", price: 12 },
  { id: "bp184", sku: "CUK-183", name: "Tartaletka premium", category: "Cukiernia", unit: "szt", price: 12 },
  { id: "bp185", sku: "CUK-184", name: "Mini sernik z czarnymi porzeczkami", category: "Cukiernia", unit: "szt", price: 12 },
  { id: "bp186", sku: "CUK-185", name: "Eklery z wiśniami", category: "Cukiernia", unit: "szt", price: 12 },
  { id: "bp187", sku: "CUK-186", name: "Ekler z budyniem", category: "Cukiernia", unit: "szt", price: 12 },
  { id: "bp188", sku: "CUK-187", name: "Mini ptysie", category: "Cukiernia", unit: "szt", price: 12 },
  { id: "bp189", sku: "CUK-188", name: "Ciastko WZ", category: "Cukiernia", unit: "szt", price: 12 },
  { id: "bp190", sku: "CUK-189", name: "Mini szarlotka", category: "Cukiernia", unit: "szt", price: 12 },
  { id: "bp191", sku: "CUK-190", name: "Rożek z kremem", category: "Cukiernia", unit: "szt", price: 12 },
  { id: "bp192", sku: "CUK-191", name: "Rogale z makiem i bakaliami", category: "Cukiernia", unit: "szt", price: 12 },
  { id: "bp193", sku: "CUK-192", name: "Kulki serowe", category: "Cukiernia", unit: "szt", price: 12 },
  { id: "bp194", sku: "CUK-193", name: "Sznek kaszubski z owocami", category: "Cukiernia", unit: "szt", price: 12 },
  { id: "bp195", sku: "CUK-194", name: "Sznek kaszubski z kruszonką", category: "Cukiernia", unit: "szt", price: 12 },
  { id: "bp196", sku: "CUK-195", name: "Pączek z malinami", category: "Cukiernia", unit: "szt", price: 12 },
  { id: "bp197", sku: "CUK-196", name: "Rolada truskawkowa", category: "Cukiernia", unit: "szt", price: 12 },
  { id: "bp198", sku: "CUK-197", name: "Rolada czekoladowo – malinowa", category: "Cukiernia", unit: "szt", price: 12 },
  { id: "bp199", sku: "CUK-198", name: "Rolada argentyńska", category: "Cukiernia", unit: "szt", price: 12 },
  { id: "bp200", sku: "CUK-199", name: "Rolada makowa", category: "Cukiernia", unit: "szt", price: 12 },
  { id: "bp201", sku: "BIS-200", name: "Jogurt z musem owocowym i granolą", category: "Bistro", unit: "szt", price: 18 },
  { id: "bp202", sku: "BIS-201", name: "Jogurt z nasionami chia", category: "Bistro", unit: "szt", price: 18 },
  { id: "bp203", sku: "BIS-202", name: "Kanapka Burger", category: "Bistro", unit: "szt", price: 18 },
  { id: "bp204", sku: "BIS-203", name: "Kanapka z szarpanym mięsem wieprzowym", category: "Bistro", unit: "szt", price: 18 },
  { id: "bp205", sku: "BIS-204", name: "Kanapka amerykańska", category: "Bistro", unit: "szt", price: 18 },
  { id: "bp206", sku: "BIS-205", name: "Kanapka polska", category: "Bistro", unit: "szt", price: 18 },
  { id: "bp207", sku: "BIS-206", name: "Kanapka z jajkiem", category: "Bistro", unit: "szt", price: 18 },
  { id: "bp208", sku: "BIS-207", name: "Kanapka włoska", category: "Bistro", unit: "szt", price: 18 },
  { id: "bp209", sku: "BIS-208", name: "Kanapka z kurczakiem", category: "Bistro", unit: "szt", price: 18 },
  { id: "bp210", sku: "BIS-209", name: "Bajgiel z burakiem pieczonym", category: "Bistro", unit: "szt", price: 18 },
  { id: "bp211", sku: "BIS-210", name: "Bajgiel z pastą jajeczną", category: "Bistro", unit: "szt", price: 18 },
  { id: "bp212", sku: "BIS-211", name: "Bajgiel z serem pleśniowym", category: "Bistro", unit: "szt", price: 18 },
  { id: "bp213", sku: "BIS-212", name: "Bajgiel bałkański z twarogiem, ajvarem i suszonymi pomidorami", category: "Bistro", unit: "szt", price: 18 },
  { id: "bp214", sku: "BIS-213", name: "Zapiekana bagietka", category: "Bistro", unit: "szt", price: 18 },
  { id: "bp215", sku: "BIS-214", name: "Zapiekana bagietka z kurczakiem", category: "Bistro", unit: "szt", price: 18 },
  { id: "bp216", sku: "BIS-215", name: "Pizza z salami", category: "Bistro", unit: "szt", price: 18 },
  { id: "bp217", sku: "BIS-216", name: "Pizza warzywna", category: "Bistro", unit: "szt", price: 18 },
  { id: "bp218", sku: "BIS-217", name: "Pizzerka hawajska", category: "Bistro", unit: "szt", price: 18 },
  { id: "bp219", sku: "BIS-218", name: "Pizzerka", category: "Bistro", unit: "szt", price: 18 },
  { id: "bp220", sku: "BIS-219", name: "Pizzerka ze szpinakiem", category: "Bistro", unit: "szt", price: 18 },
  { id: "bp221", sku: "BIS-220", name: "pizzerka z warzywami", category: "Bistro", unit: "szt", price: 18 },
  { id: "bp222", sku: "BIS-221", name: "Sałatka z serem solankowym", category: "Bistro", unit: "szt", price: 18 },
  { id: "bp223", sku: "BIS-222", name: "Sałatka z kurczakiem", category: "Bistro", unit: "szt", price: 18 },
  { id: "bp224", sku: "BIS-223", name: "Sałatka z tuńczykiem", category: "Bistro", unit: "szt", price: 18 },
  { id: "bp225", sku: "BIS-224", name: "Sałatka z serem pleśniowym i granatem", category: "Bistro", unit: "szt", price: 18 },
  { id: "bp226", sku: "BIS-225", name: "Sałatka z burakiem pieczonym", category: "Bistro", unit: "szt", price: 18 },
  { id: "bp227", sku: "BIS-226", name: "Sałatka cztery pory roku", category: "Bistro", unit: "szt", price: 18 },
  { id: "bp228", sku: "BIS-227", name: "Sałatka z pesto bazyliowym", category: "Bistro", unit: "szt", price: 18 },
  { id: "bp229", sku: "BIS-228", name: "Sałatka makaronowa", category: "Bistro", unit: "szt", price: 18 },
  { id: "bp230", sku: "BIS-229", name: "Sałatka z kaszą kuskus", category: "Bistro", unit: "szt", price: 18 },
  { id: "bp231", sku: "BIS-230", name: "Pierogi ze szpinakiem", category: "Bistro", unit: "szt", price: 18 },
  { id: "bp232", sku: "BIS-231", name: "Pierogi z serem i z jagodami", category: "Bistro", unit: "szt", price: 18 },
  { id: "bp233", sku: "BIS-232", name: "Pierogi ruskie", category: "Bistro", unit: "szt", price: 18 },
  { id: "bp234", sku: "BIS-233", name: "Pierogi toskańskie", category: "Bistro", unit: "szt", price: 18 },
  { id: "bp235", sku: "BIS-234", name: "Pieróg meksykański", category: "Bistro", unit: "szt", price: 18 },
  { id: "bp236", sku: "BIS-235", name: "Pieróg toskański", category: "Bistro", unit: "szt", price: 18 },
  { id: "bp237", sku: "BIS-236", name: "Pieróg ze szpinakiem", category: "Bistro", unit: "szt", price: 18 },
  { id: "bp238", sku: "BIS-237", name: "Pieróg z pieczarkami", category: "Bistro", unit: "szt", price: 18 },
  { id: "bp239", sku: "BIS-238", name: "Pierogi leniwe", category: "Bistro", unit: "szt", price: 18 },
  { id: "bp240", sku: "BIS-239", name: "Kluski śląskie", category: "Bistro", unit: "szt", price: 18 },
  { id: "bp241", sku: "BIS-240", name: "Krokiety z kapustą i grzybami", category: "Bistro", unit: "szt", price: 18 },
  { id: "bp242", sku: "BIS-241", name: "Krokiety z pieczarkami", category: "Bistro", unit: "szt", price: 18 },
  { id: "bp243", sku: "BIS-242", name: "Kapuśniaczki", category: "Bistro", unit: "szt", price: 18 },
  { id: "bp244", sku: "BIS-243", name: "Śniadanie polskie", category: "Bistro", unit: "szt", price: 18 },
  { id: "bp245", sku: "BIS-244", name: "Śniadanie francuskie", category: "Bistro", unit: "szt", price: 18 },
  { id: "bp246", sku: "BIS-245", name: "Śniadanie śródziemnomorskie", category: "Bistro", unit: "szt", price: 18 },
  { id: "bp247", sku: "BIS-246", name: "Śniadanie słodkie", category: "Bistro", unit: "szt", price: 18 },
  { id: "bp248", sku: "BIS-247", name: "Lemoniada", category: "Bistro", unit: "szt", price: 18 },
  { id: "bp249", sku: "BIS-248", name: "Shake", category: "Bistro", unit: "szt", price: 18 },
  { id: "bp250", sku: "BIS-249", name: "Koktajl warzywny", category: "Bistro", unit: "szt", price: 18 },
  { id: "bp251", sku: "BIS-250", name: "Koktajl truskawkowy", category: "Bistro", unit: "szt", price: 18 },
];

export interface CakeSize { id: string; label: string; price: number; }
export interface CakeFlavor { id: string; label: string; }
export interface Cake {
  id: string;
  name: string;
  description: string;
  sizes: CakeSize[];
  flavors: CakeFlavor[];
  extras: string[];
}

const SIZES_ROUND = [
  { id: "r-maly", label: "Mały (16 cm, 4-8 porcji)", price: 95 },
  { id: "r-sredni", label: "Średni (20 cm, 10-15 porcji)", price: 135 },
  { id: "r-duzy", label: "Duży (24 cm, 15-20 porcji)", price: 175 },
  { id: "r-xl", label: "XL (28 cm, 20-30 porcji)", price: 215 },
  { id: "r-xxl", label: "XXL (32 cm, 30-40 porcji)", price: 265 },
];
const SIZES_RECT = [
  { id: "b-14", label: "1/4 blachy (20×30 cm, 20-30 porcji)", price: 195 },
  { id: "b-12", label: "1/2 blachy (40×30 cm, 40-50 porcji)", price: 345 },
  { id: "b-34", label: "3/4 blachy (50×40 cm, 60-75 porcji)", price: 485 },
  { id: "b-cala", label: "Cała blacha (50×40 cm, 70-90 porcji)", price: 595 },
];
const FLAVORS_CHOC = [
  { id: "f-choc", label: "Bita śmietana czekoladowa" },
  { id: "f-choc-cherry", label: "Bita śmietana czekoladowa z wiśniami" },
  { id: "f-choc-cherry-alc", label: "Krem czekoladowy z wiśniami (z alkoholem)" },
];
const EXTRAS_STD = ["Napis na torcie", "Świeczki", "Owoce sezonowe", "Złote płatki", "Kwiaty jadalne"];

export const CAKES: Cake[] = [
  { id: "t-szwarcwaldzki", name: "Tort Szwarcwaldzki", description: "Jasne biszkopty przełożone masą czekoladową", sizes: SIZES_ROUND, flavors: FLAVORS_CHOC, extras: EXTRAS_STD },
  { id: "t-czekoladowy", name: "Tort czekoladowy", description: "Jasne biszkopty przełożone masą czekoladową", sizes: SIZES_ROUND, flavors: FLAVORS_CHOC, extras: EXTRAS_STD },
  { id: "t-czekoladowy-maliny", name: "Tort krem czekoladowy z malinami", description: "Tort czekoladowy z malinami", sizes: SIZES_ROUND, flavors: FLAVORS_CHOC, extras: EXTRAS_STD },
  { id: "t-toffi", name: "Tort bita śmietana o smaku toffi", description: "Lekki tort toffi", sizes: SIZES_ROUND, flavors: [{ id: "f-toffi", label: "Toffi" }], extras: EXTRAS_STD },
  { id: "t-fantazja", name: "Tort Fantazja", description: "Tort wielowarstwowy", sizes: SIZES_ROUND, flavors: [{ id: "f-mix", label: "Mieszany" }], extras: EXTRAS_STD },
  { id: "t-truskawkowy", name: "Tort truskawkowy", description: "Tort z truskawkami", sizes: SIZES_ROUND, flavors: [{ id: "f-straw", label: "Truskawkowy" }], extras: EXTRAS_STD },
  { id: "t-royal", name: "Tort Royal", description: "Wykwintny tort Royal", sizes: SIZES_ROUND, flavors: [{ id: "f-royal", label: "Royal" }], extras: EXTRAS_STD },
  { id: "t-porzeczkowa", name: "Tort Porzeczkowa Nuta", description: "Tort z porzeczką", sizes: SIZES_ROUND, flavors: [{ id: "f-currant", label: "Porzeczkowy" }], extras: EXTRAS_STD },
  { id: "t-roche", name: "Tort Roche", description: "Tort inspirowany pralinami", sizes: SIZES_ROUND, flavors: [{ id: "f-roche", label: "Orzechowo-czekoladowy" }], extras: EXTRAS_STD },
  { id: "t-marczello", name: "Tort Marczello", description: "Tort Marczello", sizes: SIZES_ROUND, flavors: [{ id: "f-marczello", label: "Marczelllo" }], extras: EXTRAS_STD },
  { id: "t-malina-mascarpone", name: "Tort Malina Mascarpone", description: "Tort malinowy z mascarpone", sizes: SIZES_ROUND, flavors: [{ id: "f-malina", label: "Malinowy" }], extras: EXTRAS_STD },
  { id: "t-mango-mascarpone", name: "Tort Mango Mascarpone", description: "Tort mango z mascarpone", sizes: SIZES_ROUND, flavors: [{ id: "f-mango", label: "Mango" }], extras: EXTRAS_STD },
  { id: "t-malinowy", name: "Tort malinowy", description: "Tort malinowy", sizes: SIZES_ROUND, flavors: [{ id: "f-malina2", label: "Malinowy" }], extras: EXTRAS_STD },
  { id: "t-cytrynowy", name: "Tort cytrynowy z mascarpone", description: "Tort cytrynowy", sizes: SIZES_ROUND, flavors: [{ id: "f-lemon", label: "Cytrynowy" }], extras: EXTRAS_STD },
  { id: "t-smietana-owoce", name: "Tort bita śmietana z owocami", description: "Tort ze świeżą śmietaną i owocami", sizes: SIZES_ROUND, flavors: [{ id: "f-fruit", label: "Owocowy" }], extras: EXTRAS_STD },
  { id: "t-weselny", name: "Tort weselny", description: "Tort weselny (wariant W)", sizes: SIZES_RECT, flavors: [{ id: "f-wedding", label: "Weselny" }], extras: EXTRAS_STD },
  { id: "t-specjalny", name: "Tort specjalny", description: "Tort okolicznościowy (wariant S)", sizes: SIZES_ROUND, flavors: [{ id: "f-special", label: "Specjalny" }], extras: EXTRAS_STD },
  { id: "t-dzieci", name: "Tort dla dzieci", description: "Tort dla dzieci", sizes: SIZES_ROUND, flavors: [{ id: "f-kids", label: "Dla dzieci" }], extras: EXTRAS_STD },
  { id: "t-slodki-stol", name: "Słodki stół", description: "Zestaw słodkości na stół", sizes: SIZES_RECT, flavors: [{ id: "f-sweet", label: "Mieszany" }], extras: EXTRAS_STD },
];

export const ALLERGIES = ["Gluten", "Orzechy", "Laktoza", "Jajka", "Soja"];

export const MIN_QTY: Record<string, Record<string, number>> = {
  s1: { p1: 20, p2: 10, p3: 40, p4: 2, p5: 1, p6: 30, p7: 5, p8: 2 },
  s2: { p1: 15, p2: 8, p3: 30, p4: 3, p5: 2, p6: 25, p7: 4, p8: 1 },
  s3: { p1: 25, p2: 12, p3: 50, p4: 4, p5: 2, p6: 40, p7: 6, p8: 3 },
  s4: { p1: 12, p2: 6, p3: 25, p4: 2, p5: 1, p6: 20, p7: 3, p8: 1 },
};

export interface CakeConfig {
  size: string;
  flavor: string;
  inscription?: string;
  extras: string[];
  allergies: string[];
}

export interface OrderLine {
  kind: "product" | "cake";
  ref: string;
  label: string;
  qty: number;
  unitPrice: number;
  cakeConfig?: CakeConfig;
}

export interface OrderStatusEvent { status: Order["status"]; at: string; }
export interface Order {
  id: string;
  shop: string;
  user: string;
  lines: OrderLine[];
  createdAt: string;
  status: "wysłane" | "w realizacji" | "zrealizowane" | "anulowane";
  note?: string;
  recurring?: { every: "weekly" | "monthly"; nextRun: string };
  history: OrderStatusEvent[];
}

export interface OrderTemplate {
  id: string;
  shop: string;
  user: string;
  name: string;
  lines: OrderLine[];
  createdAt: string;
}

export interface StockItem {
  product: string;
  qty: number;
  min: number;
  location: string;
  expiry?: string;
}

export const ORDERS: Order[] = [
  { id: "z-1001", shop: "s1", user: "u1", lines: [{ kind: "product", ref: "p1", label: "Chleb pszenny 500g", qty: 20, unitPrice: 4.5 }, { kind: "product", ref: "p6", label: "Pączek z różą", qty: 30, unitPrice: 3.5 }], createdAt: "2026-10-29 08:12", status: "zrealizowane", history: [{ status: "wysłane", at: "2026-10-29 08:12" }, { status: "w realizacji", at: "2026-10-29 09:00" }, { status: "zrealizowane", at: "2026-10-29 12:30" }] },
  { id: "z-1002", shop: "s2", user: "u2", lines: [{ kind: "product", ref: "p3", label: "Bułka kajzerka", qty: 30, unitPrice: 0.9 }, { kind: "product", ref: "p1", label: "Chleb pszenny 500g", qty: 15, unitPrice: 4.5 }], createdAt: "2026-10-29 09:40", status: "w realizacji", history: [{ status: "wysłane", at: "2026-10-29 09:40" }, { status: "w realizacji", at: "2026-10-29 10:15" }] },
];

export const TEMPLATES: OrderTemplate[] = [];

export function reserveStock(lines: OrderLine[]) {
  lines.forEach((l) => {
    if (l.kind !== "product") return;
    const s = STOCK.find((x) => x.product === l.ref);
    if (s) s.qty = Math.max(0, s.qty - l.qty);
  });
}

export const STOCK: StockItem[] = [
  { product: "p1", qty: 120, min: 50, location: "Magazyn główny", expiry: "2026-11-08" },
  { product: "p2", qty: 18, min: 30, location: "Magazyn główny", expiry: "2026-11-10" },
  { product: "p3", qty: 240, min: 100, location: "Magazyn główny", expiry: "2026-11-07" },
  { product: "p6", qty: 45, min: 60, location: "Magazyn główny", expiry: "2026-11-06" },
  { product: "p4", qty: 6, min: 10, location: "Magazyn główny", expiry: "2026-11-12" },
];

export interface AuditEntry { id: string; at: string; user: string; action: string; target: string; }

export const AUDIT_LOG: AuditEntry[] = [
  { id: "a1", at: "2026-10-29 08:12", user: "anna.sklep1", action: "Złożono zamówienie", target: "z-1001" },
  { id: "a2", at: "2026-10-29 09:00", user: "maria.manager", action: "Zmiana statusu", target: "z-1001 → w realizacji" },
  { id: "a3", at: "2026-10-29 09:40", user: "piotr.sklep2", action: "Złożono zamówienie", target: "z-1002" },
  { id: "a4", at: "2026-10-29 10:15", user: "admin", action: "Zmiana min. ilości", target: "p6 / s1: 30→35" },
];

export interface SaleRow {
  shop: string;
  product: string;
  qty: number;
  revenue: number;
  date: string;
}

export const SALES: SaleRow[] = [
  { shop: "s1", product: "p1", qty: 120, revenue: 540, date: "2026-10-28" },
  { shop: "s1", product: "p6", qty: 90, revenue: 315, date: "2026-10-28" },
  { shop: "s1", product: "p4", qty: 8, revenue: 304, date: "2026-10-28" },
  { shop: "s2", product: "p3", qty: 200, revenue: 180, date: "2026-10-28" },
  { shop: "s2", product: "p1", qty: 60, revenue: 270, date: "2026-10-28" },
  { shop: "s2", product: "p6", qty: 70, revenue: 245, date: "2026-10-28" },
  { shop: "s3", product: "p1", qty: 150, revenue: 675, date: "2026-10-28" },
  { shop: "s3", product: "p8", qty: 12, revenue: 624, date: "2026-10-28" },
  { shop: "s4", product: "p6", qty: 50, revenue: 175, date: "2026-10-28" },
  { shop: "s4", product: "p2", qty: 30, revenue: 156, date: "2026-10-28" },
];
