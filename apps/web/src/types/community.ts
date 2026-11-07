interface Tags {
    name: string;
    color: string;
}

export interface Community {
    id: string;
    name: string;
    description: string;
    invite_link: string;
    tags: Tags[];
}

// this is useless. this was for types
// but i realized that pgTables have a DECLARE.inferType$ or whatever.