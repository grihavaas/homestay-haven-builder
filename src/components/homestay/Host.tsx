import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { MessageCircle, Clock, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProperty } from "@/contexts/PropertyContext";
import { useEditMode } from "@/contexts/EditModeContext";
import { EditButton } from "@/components/edit-mode/EditableSection";
import { HostEditor } from "@/components/edit-mode/editors/HostEditor";

export function Host() {
  const { property, loading } = useProperty();
  const { isEditMode } = useEditMode();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [editingHost, setEditingHost] = useState<any>(null);

  if (loading || !property || !property.hosts || property.hosts.length === 0) {
    return null;
  }

  // Helper function to get host image - returns null if no image found
  const getHostImage = (host: any) => {
    return property.media?.find((m: any) =>
      m.media_type === 'host_image' && m.host_id === host.id
    )?.s3_url || property.media?.find((m: any) =>
      m.media_type === 'host_image' && !m.host_id && !m.room_id
    )?.s3_url || null;
  };

  return (
    <section id="host" className="py-20 md:py-32 bg-cream-dark">
      <div className="container mx-auto px-4">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="max-w-6xl mx-auto"
        >
          <span className="text-sm uppercase tracking-wider text-primary font-medium">
            Meet Your Hosts
          </span>
          <h2 className="text-3xl md:text-4xl font-serif font-semibold text-foreground mt-3 mb-12">
            {property.hosts.length === 1 ? 'Your Host' : 'Your Hosts'}
          </h2>

          {/* Hosts Display - Single host takes full width, multiple hosts in grid */}
          {property.hosts.length === 1 ? (
            // Single host - full width layout
            property.hosts.map((host: any) => {
              const hostImage = getHostImage(host);
              return (
                <motion.div
                  key={host.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  className="bg-card rounded-xl overflow-hidden shadow-soft hover:shadow-card transition-shadow"
                >
                  <div className="grid md:grid-cols-2 gap-0">
                    {/* Host Image - Only show if image exists */}
                    {hostImage && (
                      <div className="relative w-full aspect-square md:aspect-auto md:h-full overflow-hidden">
                        <img
                          src={hostImage}
                          alt={host.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Host Content */}
                    <div className="p-6 md:p-8">
                      <div className="relative inline-block">
                        <h3 className="text-2xl md:text-3xl font-serif font-semibold text-foreground mb-2">
                          {host.name}
                        </h3>
                        {isEditMode && (
                          <div className="absolute -right-10 top-1/2 -translate-y-1/2">
                            <EditButton onClick={() => setEditingHost(host)} label="Edit" />
                          </div>
                        )}
                      </div>
                      {host.title && (
                        <p className="text-base text-muted-foreground italic mb-6">
                          {host.title}
                        </p>
                      )}

                      {/* Bio/Writeup */}
                      {(host.bio || host.writeup) && (
                        <div className="prose prose-base text-muted-foreground mb-6">
                          {host.bio && <p className="text-base leading-relaxed">{host.bio}</p>}
                          {host.writeup && !host.bio && <p className="text-base leading-relaxed">{host.writeup}</p>}
                        </div>
                      )}

                      {/* Quick Info */}
                      <div className="space-y-4 mb-6">
                        {host.response_time && (
                          <div className="flex items-center gap-3">
                            <Clock className="w-5 h-5 text-primary flex-shrink-0" />
                            <div>
                              <div className="text-xs text-muted-foreground">Response Time</div>
                              <div className="text-base font-medium text-foreground">
                                {host.response_time}
                              </div>
                            </div>
                          </div>
                        )}
                        {host.languages && host.languages.length > 0 && (
                          <div className="flex items-start gap-3">
                            <Languages className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                            <div>
                              <div className="text-xs text-muted-foreground">Languages</div>
                              <div className="text-base font-medium text-foreground">
                                {host.languages.join(", ")}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* WhatsApp Button */}
                      {host.whatsapp && (
                        <Button
                          variant="warm"
                          size="lg"
                          className="w-full md:w-auto"
                          asChild
                        >
                          <a
                            href={`https://wa.me/${host.whatsapp.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2"
                          >
                            <MessageCircle className="w-5 h-5" />
                            Message Host
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            // Multiple hosts - grid layout
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {property.hosts.map((host: any, index: number) => {
                const hostImage = getHostImage(host);
                return (
                  <motion.div
                    key={host.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: index * 0.1 }}
                    className="bg-card rounded-xl overflow-hidden shadow-soft hover:shadow-card transition-shadow"
                  >
                    {/* Host Image - Only show if image exists */}
                    {hostImage && (
                      <div className="relative w-full aspect-square overflow-hidden">
                        <img
                          src={hostImage}
                          alt={host.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Host Content */}
                    <div className="p-6">
                      <div className="relative inline-block">
                        <h3 className="text-xl font-serif font-semibold text-foreground mb-1">
                          {host.name}
                        </h3>
                        {isEditMode && (
                          <div className="absolute -right-10 top-1/2 -translate-y-1/2">
                            <EditButton onClick={() => setEditingHost(host)} label="Edit" />
                          </div>
                        )}
                      </div>
                      {host.title && (
                        <p className="text-sm text-muted-foreground italic mb-4">
                          {host.title}
                        </p>
                      )}

                      {/* Bio/Writeup */}
                      {(host.bio || host.writeup) && (
                        <div className="prose prose-sm text-muted-foreground mb-4">
                          {host.bio && <p className="text-sm leading-relaxed line-clamp-3">{host.bio}</p>}
                          {host.writeup && !host.bio && <p className="text-sm leading-relaxed line-clamp-3">{host.writeup}</p>}
                        </div>
                      )}

                      {/* Quick Info */}
                      <div className="space-y-3 mb-4">
                        {host.response_time && (
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-primary flex-shrink-0" />
                            <div>
                              <div className="text-xs text-muted-foreground">Response Time</div>
                              <div className="text-sm font-medium text-foreground">
                                {host.response_time}
                              </div>
                            </div>
                          </div>
                        )}
                        {host.languages && host.languages.length > 0 && (
                          <div className="flex items-start gap-2">
                            <Languages className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            <div>
                              <div className="text-xs text-muted-foreground">Languages</div>
                              <div className="text-sm font-medium text-foreground">
                                {host.languages.slice(0, 2).join(", ")}
                                {host.languages.length > 2 && ` +${host.languages.length - 2} more`}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* WhatsApp Button */}
                      {host.whatsapp && (
                        <Button
                          variant="warm"
                          size="sm"
                          className="w-full"
                          asChild
                        >
                          <a
                            href={`https://wa.me/${host.whatsapp.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2"
                          >
                            <MessageCircle className="w-4 h-4" />
                            Message Host
                          </a>
                        </Button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      {/* Host Editor Bottom Sheet */}
      <HostEditor
        isOpen={!!editingHost}
        onClose={() => setEditingHost(null)}
        host={editingHost}
      />
    </section>
  );
}
