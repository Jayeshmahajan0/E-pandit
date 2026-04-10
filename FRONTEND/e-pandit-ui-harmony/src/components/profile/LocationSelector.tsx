import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Navigation, ChevronDown, Search } from "lucide-react";
import { getStateNames, getDistrictsByState } from "@/data/locationData";
import type { District } from "@/data/locationData";

interface LocationData {
  locationEnabled: boolean;
  state: string;
  district: string;
  pinCode: string;
}

interface LocationSelectorProps {
  initialData?: Partial<LocationData>;
  onSave: (data: LocationData) => void;
}

const LocationSelector = ({ initialData, onSave }: LocationSelectorProps) => {
  const [locationEnabled, setLocationEnabled] = useState(
    initialData?.locationEnabled ?? false
  );
  const [selectedState, setSelectedState] = useState(
    initialData?.state || ""
  );
  const [selectedDistrict, setSelectedDistrict] = useState(
    initialData?.district || ""
  );
  const [pinCode, setPinCode] = useState(initialData?.pinCode || "");
  const [districts, setDistricts] = useState<District[]>([]);
  const [stateDropdownOpen, setStateDropdownOpen] = useState(false);
  const [districtDropdownOpen, setDistrictDropdownOpen] = useState(false);
  const [stateSearch, setStateSearch] = useState("");
  const [districtSearch, setDistrictSearch] = useState("");

  const stateNames = getStateNames();

  useEffect(() => {
    if (selectedState) {
      setDistricts(getDistrictsByState(selectedState));
    } else {
      setDistricts([]);
    }
  }, [selectedState]);

  const handleToggle = () => {
    const newValue = !locationEnabled;
    setLocationEnabled(newValue);
    if (!newValue) {
      setSelectedState("");
      setSelectedDistrict("");
      setPinCode("");
    }
  };

  const handleSave = () => {
    onSave({
      locationEnabled,
      state: selectedState,
      district: selectedDistrict,
      pinCode,
    });
  };

  const filteredStates = stateNames.filter((s) =>
    s.toLowerCase().includes(stateSearch.toLowerCase())
  );
  const filteredDistricts = districts.filter((d) =>
    d.name.toLowerCase().includes(districtSearch.toLowerCase())
  );

  const isComplete = locationEnabled && selectedState && selectedDistrict;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-card rounded-2xl p-5 md:p-7 shadow-card"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center">
            <MapPin className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-serif text-lg md:text-xl font-semibold text-foreground">
              Location
            </h2>
            <p className="text-xs text-muted-foreground">
              Set your location to find nearby pandits
            </p>
          </div>
        </div>
      </div>

      {/* Location Toggle */}
      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl mb-5">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{
              color: locationEnabled ? "hsl(36 85% 50%)" : "hsl(20 10% 50%)",
            }}
          >
            <Navigation className="w-5 h-5" />
          </motion.div>
          <div>
            <p className="text-sm font-medium text-foreground">
              Enable Location Services
            </p>
            <p className="text-xs text-muted-foreground">
              Allow E-Pandit to use your location
            </p>
          </div>
        </div>

        {/* Custom Toggle */}
        <button
          onClick={handleToggle}
          className={`relative w-14 h-7 rounded-full transition-all duration-300 ${
            locationEnabled
              ? "bg-gradient-to-r from-saffron to-gold shadow-soft"
              : "bg-border"
          }`}
          aria-label="Toggle location"
        >
          <motion.div
            animate={{ x: locationEnabled ? 28 : 2 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-md"
          />
        </button>
      </div>

      {/* Location Fields */}
      <AnimatePresence>
        {locationEnabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4 overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* State Dropdown */}
              <div className="space-y-1.5 relative">
                <label className="text-sm font-medium text-foreground">
                  State
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setStateDropdownOpen(!stateDropdownOpen);
                    setDistrictDropdownOpen(false);
                  }}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm text-left flex items-center justify-between hover:border-primary transition-colors"
                >
                  <span
                    className={
                      selectedState ? "text-foreground" : "text-muted-foreground"
                    }
                  >
                    {selectedState || "Select State"}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-muted-foreground transition-transform ${
                      stateDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {stateDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-elevated z-30 max-h-60 overflow-hidden"
                    >
                      <div className="p-2 border-b border-border">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                          <input
                            type="text"
                            placeholder="Search state..."
                            value={stateSearch}
                            onChange={(e) => setStateSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 text-sm bg-muted rounded-lg outline-none focus:ring-1 focus:ring-primary"
                          />
                        </div>
                      </div>
                      <div className="max-h-44 overflow-y-auto">
                        {filteredStates.map((state) => (
                          <button
                            key={state}
                            onClick={() => {
                              setSelectedState(state);
                              setSelectedDistrict("");
                              setStateDropdownOpen(false);
                              setStateSearch("");
                            }}
                            className={`w-full px-4 py-2.5 text-sm text-left hover:bg-secondary transition-colors ${
                              selectedState === state
                                ? "bg-secondary text-primary font-medium"
                                : "text-foreground"
                            }`}
                          >
                            {state}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* District Dropdown */}
              <div className="space-y-1.5 relative">
                <label className="text-sm font-medium text-foreground">
                  District
                </label>
                <button
                  type="button"
                  onClick={() => {
                    if (selectedState) {
                      setDistrictDropdownOpen(!districtDropdownOpen);
                      setStateDropdownOpen(false);
                    }
                  }}
                  disabled={!selectedState}
                  className={`w-full px-4 py-3 rounded-xl border border-border bg-background text-sm text-left flex items-center justify-between transition-colors ${
                    selectedState
                      ? "hover:border-primary"
                      : "opacity-50 cursor-not-allowed"
                  }`}
                >
                  <span
                    className={
                      selectedDistrict
                        ? "text-foreground"
                        : "text-muted-foreground"
                    }
                  >
                    {selectedDistrict || "Select District"}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-muted-foreground transition-transform ${
                      districtDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {districtDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-elevated z-30 max-h-60 overflow-hidden"
                    >
                      <div className="p-2 border-b border-border">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                          <input
                            type="text"
                            placeholder="Search district..."
                            value={districtSearch}
                            onChange={(e) => setDistrictSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 text-sm bg-muted rounded-lg outline-none focus:ring-1 focus:ring-primary"
                          />
                        </div>
                      </div>
                      <div className="max-h-44 overflow-y-auto">
                        {filteredDistricts.map((district) => (
                          <button
                            key={district.name}
                            onClick={() => {
                              setSelectedDistrict(district.name);
                              setDistrictDropdownOpen(false);
                              setDistrictSearch("");
                            }}
                            className={`w-full px-4 py-2.5 text-sm text-left hover:bg-secondary transition-colors ${
                              selectedDistrict === district.name
                                ? "bg-secondary text-primary font-medium"
                                : "text-foreground"
                            }`}
                          >
                            {district.name}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Pin Code */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                Pin Code
              </label>
              <input
                type="text"
                value={pinCode}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setPinCode(val);
                }}
                placeholder="Enter 6-digit pin code"
                maxLength={6}
                className="w-full max-w-xs px-4 py-3 rounded-xl border border-border bg-background text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            {/* Selected location badge */}
            <AnimatePresence>
              {isComplete && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex items-center gap-3 p-4 bg-gradient-to-r from-secondary to-muted rounded-xl border border-border"
                >
                  <div className="w-10 h-10 bg-gradient-saffron rounded-full flex items-center justify-center shadow-soft shrink-0">
                    <MapPin className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">
                      📍 {selectedDistrict}, {selectedState}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Pandits in your area will be shown first
                      {pinCode ? ` • PIN: ${pinCode}` : ""}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Save Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              disabled={!isComplete}
              className="px-6 py-3 bg-gradient-saffron text-primary-foreground rounded-xl font-semibold text-sm shadow-soft hover:shadow-glow transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Location
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default LocationSelector;
