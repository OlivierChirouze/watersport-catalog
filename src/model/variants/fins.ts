// Number and box types of fin boxes
export type FinConfig = {
    count?: number;
    type: FinBoxType;
};

// Types of fin box
export enum FinBoxType {
    TuttleBox = "TuttleBox",
    MiniTuttleBox = "MiniTuttleBox",
    DeepTuttleBox = "DeepTuttleBox",
    US = "US", // When length is unknown
    US5 = "US5",
    US6 = "US6",
    US8 = "US8",
    SlotBox = "SlotBox",
    PowerBox = "PowerBox",
    FCS = "FCS",
    StarBox = "StarBox"
}
