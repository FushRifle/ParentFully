import { supabase } from "@/supabase/client";

type FamilyRelationship = {
    id: string;
    relationship: string;
    parent: {
        id: string;
        first_name: string;
        last_name: string;
        email: string;
        avatar_url: string | null;
    } | null;
    member: {
        id: string;
        first_name: string;
        last_name: string;
        email: string;
        avatar_url: string | null;
    } | null;
    created_at: string;
};

type FamilyMember = {
    id: string;
    name: string;
    email: string;
    relationship: string;
    avatar: string | null;
};

export const fetchFamilyMembers = async (userId: string): Promise<FamilyMember[]> => {
    const { data, error } = await supabase
        .from('family_relationships')
        .select(`
      id,
      relationship,
      parent:parent_id(id, email, first_name, last_name, avatar_url),
      member:member_id(id, email, first_name, last_name, avatar_url),
      created_at
    `)
        .or(`parent_id.eq.${userId},member_id.eq.${userId}`);

    if (error) {
        console.error('Error fetching family relationships:', error);
        throw error;
    }

    const relationships = data as unknown as FamilyRelationship[];

    return relationships
        .flatMap(rel => [
            rel.parent ? {
                id: rel.parent.id,
                name: `${rel.parent.first_name} ${rel.parent.last_name}`,
                email: rel.parent.email,
                relationship: rel.relationship,
                avatar: rel.parent.avatar_url
            } : null,
            rel.member ? {
                id: rel.member.id,
                name: `${rel.member.first_name} ${rel.member.last_name}`,
                email: rel.member.email,
                relationship: rel.relationship,
                avatar: rel.member.avatar_url
            } : null
        ])
        .filter((member): member is FamilyMember => member !== null)
        .filter((member, index, arr) =>
            arr.findIndex(m => m.id === member.id) === index
        );
};